require("dotenv").config();
const Groq = require("groq-sdk");
const { decrypt, encrypt } = require("../models/encryptDecrypt");
const { getPrompt } = require("./getPrompts");

const algorithm = process.env.CRYPTO_ALGORITHM;

async function getGroqResponse(prompt, apiKey) {
  console.log("🤖 Groq Request:", {
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    max_tokens: 200,
  });

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  return completion.choices[0].message.content;
}

const chatController = {
  async handleChatRequest(req, res) {
    try {
      console.log("\n===== NEW CHAT REQUEST =====");

      console.log("➡️ Request Body:", {
        type: req.body.type,
        tokenPreview: req.body.token?.slice(0, 30) + "...",
      });

      const { token, type } = req.body;

      const secretKey = process.env[`${type}_CRYPTO_SECRET_KEY`];
      const ivKey = process.env[`${type}_CRYPTO_IV`];
      const encryptedApiKey =
        process.env[`${type}_GROQ_API_KEY_ENCRYPTED`];

      console.log("🔑 Crypto Config:", {
        algorithm,
        secretKeyLength: secretKey?.length,
        iv: ivKey,
      });

      /* ---------- API KEY ---------- */
      console.log("🔓 Groq API Key Decryption:", {
        encryptedPreview: encryptedApiKey.slice(0, 25) + "...",
      });

      const decryptedApiKey = decrypt(
        encryptedApiKey,
        secretKey,
        ivKey,
        algorithm
      );

      console.log("✅ Groq API Key Decrypted:", {
        preview: decryptedApiKey.data.slice(0, 12) + "...",
      });

      /* ---------- TOKEN ---------- */
      console.log("🔓 Token Decryption:", {
        encryptedPreview: token.slice(0, 30) + "...",
      });

      const decryptedToken = decrypt(token, secretKey, ivKey, algorithm);

      console.log("✅ Token Decrypted:", {
        decryptedToken: decryptedToken.data,
      });

      const tokenData = JSON.parse(decryptedToken.data);

      const {
        task: { type: taskType, sub_type, user_input },
      } = tokenData;

      console.log("📦 Parsed Token Data:", {
        taskType,
        sub_type,
        user_input,
      });

      /* ---------- PROMPT ---------- */
      const prompt = await getPrompt(taskType, sub_type, user_input);

      console.log("🧩 Generated Prompt:", {
        preview: prompt.slice(0, 120) + "...",
        length: prompt.length,
      });

      /* ---------- GROQ ---------- */
      const groqResponse = await getGroqResponse(
        prompt,
        decryptedApiKey.data
      );

      console.log("🧠 Groq AI Response:", {
        response: groqResponse,
        length: groqResponse.length,
      });

      /* ---------- ENCRYPT ---------- */
      const encryptedResponse = encrypt(
        groqResponse,
        secretKey,
        ivKey,
        algorithm
      );

      console.log("🔐 Encrypted Response:", {
        preview: encryptedResponse.data.slice(0, 60) + "...",
        length: encryptedResponse.data.length,
      });

      /* ---------- VERIFY ---------- */
      const verify = decrypt(
        encryptedResponse.data,
        secretKey,
        ivKey,
        algorithm
      );

      console.log("🔓 Decrypted Response (Verify):", {
        response: verify.data,
      });

      console.log("===== REQUEST END =====\n");

      return res.json({
        status: true,
        message: "The response has been successfully encrypted...",
        data: encryptedResponse.data,
      });
    } catch (error) {
      console.error("❌ SERVER ERROR:", error.message);
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
};

module.exports = chatController;
