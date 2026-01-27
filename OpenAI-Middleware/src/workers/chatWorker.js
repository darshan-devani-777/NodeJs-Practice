const { Worker } = require("bullmq");
const { getBullMQConnection } = require("../lib/redisClient");
const { moveToDLQ } = require("../lib/queue");
const Groq = require("groq-sdk");
const { decrypt } = require("../models/encryptDecrypt");
const { getPrompt } = require("../controllers/getPrompts");
const { searchSimilarDocuments, rerankDocuments } = require("../lib/ragPipeline");

let worker;

// PROCESS CHAT JOB - LLM, RAG, RE-RENKING
async function processChatJob(job) {
  const { data } = job;
  const startTime = Date.now();

  console.log("🔨 [WORKER] Processing chat job", {
    jobId: job.id,
    type: data.type,
    hasTask: !!data.task,
    attempt: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts,
  });

  try {
    // Extract task data
    const token = data.token;
    const type = data.type || data?.task?.type;

    if (!type) {
      throw new Error("Task type is missing (encrypted or raw)");
    }

    const algorithm = process.env.CRYPTO_ALGORITHM;
    const secretKey = process.env[`${type}_CRYPTO_SECRET_KEY`];
    const ivKey = process.env[`${type}_CRYPTO_IV`];
    const encryptedApiKey = process.env[`${type}_GROQ_API_KEY_ENCRYPTED`];

    console.log("🔑 [WORKER] Crypto config loaded", {
      jobId: job.id,
      type,
      hasSecretKey: !!secretKey,
      hasApiKey: !!encryptedApiKey,
    });

    const decryptedApiKey = decrypt(
      encryptedApiKey,
      secretKey,
      ivKey,
      algorithm
    );

    if (!decryptedApiKey.status || !decryptedApiKey.data) {
      throw new Error("Failed to decrypt API key");
    }

    console.log("✅ [WORKER] API key decrypted", {
      jobId: job.id,
      apiKeyPreview: decryptedApiKey.data.slice(0, 12) + "...",
    });

    let tokenData;
    if (token) {
      console.log("🔓 [WORKER] Decrypting token", {
        jobId: job.id,
        tokenPreview: token.slice(0, 30) + "...",
      });

      const decryptedToken = decrypt(token, secretKey, ivKey, algorithm);
      if (!decryptedToken.status) {
        throw new Error("Failed to decrypt token");
      }
      tokenData = JSON.parse(decryptedToken.data);
    } else {
      console.log("📝 [WORKER] Using raw mode", { jobId: job.id });
      tokenData = { task: data.task };
    }

    const {
      task: { type: taskType, sub_type, user_input },
    } = tokenData;

    console.log("📦 [WORKER] Task data extracted", {
      jobId: job.id,
      taskType,
      sub_type,
      userInputLength: user_input?.length || 0,
    });

    // RAG Pipeline (if Qdrant is configured)
    let ragContext = "";
    try {
      console.log("🔍 [WORKER] Starting RAG search", { jobId: job.id });
      const similarDocs = await searchSimilarDocuments(user_input);

      if (similarDocs && similarDocs.length > 0) {
        console.log("📚 [WORKER] Found similar documents", {
          jobId: job.id,
          count: similarDocs.length,
        });

        // Re-rank documents
        const rerankedDocs = await rerankDocuments(user_input, similarDocs);
        ragContext = rerankedDocs
          .slice(0, 3)
          .map((doc) => doc.text || doc.content)
          .join("\n\n");

        console.log("🔄 [WORKER] Documents re-ranked", {
          jobId: job.id,
          contextLength: ragContext.length,
        });
      } else {
        console.log("ℹ️ [WORKER] No similar documents found, proceeding without RAG", {
          jobId: job.id,
        });
      }
    } catch (ragError) {
      console.warn("⚠️ [WORKER] RAG pipeline failed, continuing without RAG", {
        jobId: job.id,
        error: ragError.message,
      });
    }

    // Generate prompt
    const basePrompt = await getPrompt(taskType, sub_type, user_input);
    const finalPrompt = ragContext
      ? `Context from knowledge base:\n${ragContext}\n\nUser query: ${basePrompt}`
      : basePrompt;

    console.log("🧩 [WORKER] Prompt generated", {
      jobId: job.id,
      promptLength: finalPrompt.length,
      hasRAGContext: !!ragContext,
    });

    // Call LLM
    console.log("🤖 [WORKER] Calling LLM", {
      jobId: job.id,
      model: "llama-3.1-8b-instant",
    });

    const groq = new Groq({ apiKey: decryptedApiKey.data });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "";

    const processingTime = Date.now() - startTime;

    console.log("✅ [WORKER] Job completed successfully", {
      jobId: job.id,
      responseLength: response.length,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      response,
      processingTimeMs: processingTime,
      hasRAGContext: !!ragContext,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error("❌ [WORKER] Job processing failed", {
      jobId: job.id,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
    });

    if (job.attemptsMade >= job.opts.attempts - 1) {
      console.log("💀 [WORKER] Max attempts reached, moving to DLQ", {
        jobId: job.id,
        attemptsMade: job.attemptsMade + 1,
      });

      try {
        await moveToDLQ(job, error);
        console.log("✅ [WORKER] Job moved to DLQ", { jobId: job.id });
      } catch (dlqError) {
        console.error("❌ [WORKER] Failed to move to DLQ", {
          jobId: job.id,
          error: dlqError.message,
        });
      }
    }

    throw error;
  }
}

// INITIALIZE CHAT WORKER
function startChatWorker() {
  if (worker) {
    console.log("⚠️ [WORKER] Worker already running");
    return worker;
  }

  const redis = getBullMQConnection();
  const concurrency = Number(process.env.WORKER_CONCURRENCY || 5);

  console.log("👷 [WORKER] Starting Chat Worker", {
    queueName: "chat-processing",
    concurrency,
    hasRedis: !!redis,
  });

  worker = new Worker(
    "chat-processing",
    async (job) => {
      return await processChatJob(job);
    },
    {
      connection: redis,
      concurrency,
      limiter: {
        max: Number(process.env.WORKER_RATE_LIMIT || 10),
        duration: Number(process.env.WORKER_RATE_DURATION || 1000),
      },
    }
  );

  // Worker event listeners
  worker.on("completed", (job, result) => {
    console.log("✅ [WORKER] Worker completed job", {
      jobId: job.id,
      result: result?.success ? "success" : "unknown",
      processingTime: result?.processingTimeMs,
    });
  });

  worker.on("failed", (job, err) => {
    console.error("❌ [WORKER] Worker failed job", {
      jobId: job?.id || "unknown",
      error: err.message,
      attemptsMade: job?.attemptsMade || 0,
    });
  });

  worker.on("error", (err) => {
    console.error("❌ [WORKER] Worker error", {
      error: err.message,
      stack: err.stack,
    });
  });

  worker.on("stalled", (jobId) => {
    console.warn("⚠️ [WORKER] Worker stalled", { jobId });
  });

  console.log("✅ [WORKER] Chat Worker started successfully", {
    concurrency,
    queueName: "chat-processing",
  });

  return worker;
}

// STOP CHAT WORKER
async function stopChatWorker() {
  if (!worker) {
    console.log("⚠️ [WORKER] No worker to stop");
    return;
  }

  console.log("🛑 [WORKER] Stopping Chat Worker");

  try {
    await worker.close();
    worker = null;
    console.log("✅ [WORKER] Chat Worker stopped");
  } catch (error) {
    console.error("❌ [WORKER] Error stopping worker", {
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  startChatWorker,
  stopChatWorker,
  processChatJob,
};

