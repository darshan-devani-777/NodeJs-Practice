<!-- Set up environment variables: -->

--> **Create a .env file in the root directory**

PORT=9090

**# Encryption algorithm**
CRYPTO_ALGORITHM=CRYPTO_ALGORITHM

**# For SC Type**
SC_CRYPTO_SECRET_KEY=SC_CRYPTO_SECRET_KEY
SC_CRYPTO_IV=SC_CRYPTO_IV        

**# For TB Type**
TB_CRYPTO_SECRET_KEY=TB_CRYPTO_SECRET_KEY
TB_CRYPTO_IV=TB_CRYPTO_IV

**# GroqAI API Key**
SC_GROQ_API_KEY_ENCRYPTED=SC_GROQ_API_KEY_ENCRYPTED
TB_GROQ_API_KEY_ENCRYPTED=TB_GROQ_API_KEY_ENCRYPTED
GROQ_API_KEY=GROQ_API_KEY

**# OpenAI API key** 
SC_OPENAI_API_KEY_ENCRYPTED=SC_OPENAI_API_KEY_ENCRYPTED
TB_OPENAI_API_KEY_ENCRYPTED=TB_OPENAI_API_KEY_ENCRYPTED

**# API Gateway Key**
API_GATEWAY_KEY=API_GATEWAY_KEY

**# Queue **Configuration**
QUEUE_MAX_ATTEMPTS=3              # Retry attempts before DLQ
QUEUE_BACKOFF_DELAY=2000          # Initial backoff delay (ms)
QUEUE_COMPLETE_TTL=3600           # Keep completed jobs (seconds)
QUEUE_COMPLETE_COUNT=100          # Max completed jobs to keep

**# Worker Configuration**
WORKER_CONCURRENCY=5              # Jobs processed simultaneously
WORKER_RATE_LIMIT=10              # Jobs per second
WORKER_RATE_DURATION=1000         # Rate limit window (ms)

**# Stability API Key**
STABILITY_API_KEY=STABILITY_API_KEY

**# HiggingFace API Key**
HUGGINGFACE_API_KEY=STABILITY_API_KEY

<!-- Create prompts.json: -->

**In the root directory, create a prompts.json file**

1. **Client Request (Encryption)**
- A client sends a request to the /api/chatGPT endpoint with a token and type.
- The request should contain a token (which is the encrypted version of the request data, including the task with type, sub_type, and user_input).
- The token is decrypted using the SC_CRYPTO_SECRET_KEY and SC_CRYPTO_IV to retrieve the task data.

*The task contains:*

type: Defines the category (e.g., SC for summarization or TC for text corrections).
sub_type: Defines whether the task is long, short, etc.
user_input: The actual content or text that will be processed (e.g., "Artificial intelligence is transforming the world.").

2. **Prompt Generation**
- Based on the type and sub_type, the getPrompt function retrieves the corresponding prompt template from the prompts.json file.
- The user_input is inserted into the prompt template.

3. **OpenAI API Request**
- The generated prompt is sent to OpenAI's GPT-3.5 model using the OpenAI API.
- The model processes the prompt and generates a response.

4. **Encryption of the Response**
- The generated response from OpenAI is encrypted using the same encryption keys and algorithm (SC_CRYPTO_SECRET_KEY, SC_CRYPTO_IV, and CRYPTO_ALGORITHM).
- The encrypted response is sent back to the client.

5. **Client Response (Decryption)**
The client receives the encrypted response and can decrypt it using the same keys to get the final OpenAI-generated response.

<!-- API Endpoints -->
POST /api/chatGPT
POST http://localhost:3000/api/chatGPT

**This endpoint accepts the request body with the following fields:**

token: The encrypted token containing the task data.

type: Type of task (SC or TC).

<!-- Request :- -->
{
  "token": "encrypted-token-here",
  "type": "SC"
}

<!-- Response :- -->
{
  "status": true,
  "message": "The response has been successfully encrypted...",
  "data": "encrypted-response-here"
}

<!-- AI Image Generation API -->

## 🎨 AI Image Generation API

**POST** `/api/imageGenerate`  
**Endpoint**: `http://localhost:3000/api/imageGenerate`

**This endpoint generates AI images using Hugging Face's StabilityAI Stable Diffusion XL model.**

### Request Body:
```json
{
  "prompt": "A beautiful landscape with mountains and a lake at sunset"
}
```

### Response (Success):
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "rateLimit": {
    "remaining": 95,
    "limit": 100,
    "reset": "2024-01-20T15:30:00Z"
  }
}
```

### Response (Error):
```json
{
  "success": false,
  "error": "Hugging Face API error",
  "raw": "API response details...",
  "rateLimit": {
    "remaining": 0,
    "limit": 100,
    "reset": "2024-01-20T15:30:00Z"
  }
}
```

### Features:
- 🎨 Uses StabilityAI's Stable Diffusion XL Base 1.0 model
- 📊 Rate limit monitoring and reporting
- 🖼️ Base64 encoded image response
- ⚡ Direct integration with Hugging Face Inference API
- 🛡️ Comprehensive error handling

### Frontend Integration:
The web interface (`/index.html`) includes a dedicated image generation button that:
- Shows loading animations during generation
- Displays generated images inline with chat
- Handles errors gracefully
- Maintains chat flow continuity

---

<!-- # Implementation Summary - New Features Added -->

## 🏗️ Architecture Implementation

### API Gateway Layer
- ✅ Created authentication middleware with `x-api-key` header validation
- ✅ Implemented Redis-backed rate limiting middleware with configurable limits
- ✅ Added request validation middleware for chat payloads (encrypted & raw modes)
- ✅ Integrated gateway pipeline: Auth → Rate Limit → Validation → Routes
- ✅ Added comprehensive logging for all gateway operations

### Redis Integration
- ✅ Created Redis client with separate connections for general use and BullMQ
- ✅ Implemented response caching layer with TTL configuration
- ✅ Integrated Redis for rate limiting with sliding window algorithm
- ✅ Added Redis connection health checks and error handling
- ✅ Configured BullMQ-compatible Redis connection (`maxRetriesPerRequest: null`)

### Queue System (BullMQ)
- ✅ Implemented main queue (`chat-processing`) with retry logic
- ✅ Created Dead-Letter Queue (`chat-processing-dlq`) for failed jobs
- ✅ Added queue event listeners for monitoring (completed, failed, stalled)
- ✅ Configured exponential backoff retry mechanism
- ✅ Implemented queue statistics endpoint with detailed job samples
- ✅ Added job status tracking endpoint

### Worker Pool
- ✅ Created worker pool with configurable concurrency
- ✅ Implemented job processing with LLM calls (Groq integration)
- ✅ Added RAG pipeline integration (vector search + re-ranking)
- ✅ Implemented automatic DLQ movement after max retry attempts
- ✅ Added worker rate limiting and error handling
- ✅ Created graceful worker shutdown on SIGTERM/SIGINT

### Dead-Letter Queue (DLQ) Management
- ✅ Implemented DLQ job storage with failure details (reason, stack trace, attempts)
- ✅ Created DLQ job listing endpoint with pagination
- ✅ Added DLQ job details endpoint for debugging
- ✅ Implemented DLQ job retry functionality
- ✅ Added DLQ statistics endpoint
- ✅ Created DLQ clear endpoint (with confirmation)

### Vector Database (Qdrant)
- ✅ Integrated Qdrant client with Cloud and local support
- ✅ Created RAG pipeline utilities (search, store, re-rank)
- ✅ Added Qdrant health check functionality
- ✅ Configured graceful fallback when Qdrant unavailable

### API Endpoints
- ✅ `/api/chatGPT` - Streaming endpoint (existing, enhanced with gateway)
- ✅ `/api/chatGPT/queue` - Queue endpoint (non-streaming, uses worker pool)
- ✅ `/api/queue/stats` - Queue statistics with job samples
- ✅ `/api/queue/jobs/:jobId` - Get job status
- ✅ `/api/dlq/jobs` - List DLQ jobs
- ✅ `/api/dlq/jobs/:jobId` - Get DLQ job details
- ✅ `/api/dlq/jobs/:jobId/retry` - Retry DLQ job
- ✅ `/api/dlq/stats` - DLQ statistics
- ✅ `/api/dlq/clear` - Clear DLQ (with confirmation)

### Logging & Monitoring
- ✅ Added structured logging throughout all components
- ✅ Implemented queue operation logs (add, process, complete, fail)
- ✅ Added worker processing logs with timing information
- ✅ Created DLQ operation logs (move, retry, clear)
- ✅ Added gateway logs (auth, rate limit, validation)
- ✅ Implemented Redis connection logs
- ✅ Added error logging with stack traces

### Configuration & Environment
- ✅ Added `API_GATEWAY_KEY` for authentication
- ✅ Configured Redis connection options (`REDIS_HOST`, `REDIS_PORT`, `REDIS_URL`)
- ✅ Added queue configuration (`QUEUE_MAX_ATTEMPTS`, `QUEUE_BACKOFF_DELAY`)
- ✅ Configured worker settings (`WORKER_CONCURRENCY`, `WORKER_RATE_LIMIT`)
- ✅ Added Qdrant configuration (`QDRANT_URL`, `QDRANT_API_KEY`)
- ✅ Configured cache TTL (`CACHE_TTL_SECONDS`)
- ✅ Added rate limit configuration (`RATE_LIMIT_WINDOW_SEC`, `RATE_LIMIT_MAX`)

### Testing & Documentation
- ✅ Created comprehensive test script (`test-queue.js`)
- ✅ Added testing guide with manual test scenarios
- ✅ Created DLQ guide with API documentation
- ✅ Added Postman examples for all endpoints
- ✅ Created environment setup guide
- ✅ Added troubleshooting documentation
- ✅ Created macOS setup guide (no Docker)

### Error Handling
- ✅ Implemented graceful Redis failure handling (fail-open for rate limiter)
- ✅ Added Qdrant fallback when unavailable
- ✅ Created retry logic with exponential backoff
- ✅ Implemented DLQ for permanently failed jobs
- ✅ Added comprehensive error logging
- ✅ Created validation error responses

### Server Integration
- ✅ Integrated worker pool auto-start on server initialization
- ✅ Added graceful shutdown handlers (SIGTERM, SIGINT)
- ✅ Configured CORS for API endpoints
- ✅ Added static file serving
- ✅ Implemented request body parsing

---

## 📊 Summary Statistics

- **New Files Created**: 16+ (including image generation)
- **New Endpoints**: 10 (9 chat/queue + 1 image generation)
- **New Middleware**: 3 (Auth, Rate Limit, Validation)
- **New Libraries Integrated**: 4 (BullMQ, ioredis, @qdrant/js-client-rest, Hugging Face)
- **AI Features**: ChatGPT API + AI Image Generation
- **Lines of Code Added**: ~2200+
- **Documentation Files**: 6

---

## 🔄 Flow Comparison

### Before (Existing):
```
Client → Express → Chat Controller → Groq API → SSE Stream → Client
```

### After (New Implementation):
```
Client (Web + API)
  ├── Chat Interface → Express → Chat Controller → Groq/OpenAI → SSE Stream
  └── Image Generation → Express → Image Controller → Hugging Face API → Base64 Image
       ↓
API Gateway
  ├── Auth (x-api-key)
  ├── Rate Limiting (Redis)
  └── Request Validation
       ↓
Node.js API (Stateless)
  ├── Redis (cache + rate limit)
  ├── Vector DB (Qdrant)
  ├── Queue (BullMQ)
  └── SSE Streaming
       ↓
Worker Pool
  ├── LLM Calls (Chat)
  ├── AI Image Generation
  ├── RAG Pipeline
  ├── Re-ranking
  └── Response Cache
       ↓
Dead-Letter Queue (DLQ)
  └── Failed Jobs Management
```

---

## ✅ Key Features

1. **API Gateway**: Auth, rate limiting, validation
2. **ChatGPT Integration**: Encrypted streaming chat with Groq/OpenAI
3. **🎨 AI Image Generation**: Hugging Face + StabilityAI integration
4. **Queue System**: Async job processing with retry logic
5. **Worker Pool**: Concurrent processing with rate limiting
6. **Dead-Letter Queue**: Failed job management and retry
7. **Vector DB**: Qdrant integration for RAG
8. **Caching**: Redis-based response caching
9. **Monitoring**: Comprehensive logging and statistics
10. **Error Handling**: Graceful degradation and DLQ
11. **Web Interface**: Complete chat + image generation UI

---

## 🎯 Implementation Status

✅ **Completed**: All requested features implemented
✅ **Tested**: Test scripts and guides provided
✅ **Documented**: Comprehensive documentation created
✅ **Production Ready**: Error handling and logging in place

<!-- AI Image Generation Implementation -->

## 🎨 AI Image Generation

### Implementation Details

**Framework**: Hugging Face Inference API  
**Model**: StabilityAI Stable Diffusion XL Base 1.0  
**Endpoint**: `POST /api/imageGenerate`

### Features Implemented

- ✅ **Hugging Face Integration**: Direct API calls to Hugging Face's inference router
- ✅ **StabilityAI Models**: Uses high-quality Stable Diffusion XL models
- ✅ **Base64 Image Response**: Images returned as base64-encoded data URLs
- ✅ **Rate Limit Monitoring**: Tracks API usage and rate limits
- ✅ **Error Handling**: Comprehensive error handling with detailed logging
- ✅ **Web Interface**: Integrated image generation button in chat interface
- ✅ **Real-time Generation**: Visual loading states and progress indicators

### API Usage

**Request:**
```json
{
  "prompt": "A beautiful sunset over mountains"
}
```

**Response:**
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "rateLimit": {
    "remaining": 95,
    "limit": 100,
    "reset": "2024-01-20T15:30:00Z"
  }
}
```

### Environment Variables

```env
# Required for image generation
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### Supported Models

1. **Stable Diffusion XL Base 1.0** (Currently Implemented)
   - High-quality image generation
   - 1024x1024 resolution capability
   - Via Hugging Face Inference API

2. **Stable Image Core** (Referenced for future implementation)
   - StabilityAI's optimized model
   - Alternative API endpoint available

### Frontend Integration

The web interface includes:
- 🎨 Image generation button in chat input
- 🖼️ Visual loading placeholder with animations
- 📏 Responsive image display (400px max width)
- ⚡ Real-time image loading with fade-in effects
- ❌ Error handling with user-friendly messages

### Rate Limiting

- Tracks remaining API calls
- Logs rate limit headers from Hugging Face
- Graceful error handling when limits are exceeded

---

<!-- Legacy Model References -->

**Additional StabilityAI Models Available:**
- **Stable Image Core**: https://api.stability.ai/v2beta/stable-image/generate/core
- **Stable Diffusion XL Base 1.0**: https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0


<!-- **Image Upload → Text Generation API** -->

- Client Uploads Image
- User uploads an image via frontend (input[type=file]).
- Image is sent to backend using multipart/form-data.
- API Endpoint Receives Image

Endpoint: POST /api/imageToText

- Middleware: multer (memory storage)
- Image is available as req.file.buffer.
- Hugging Face Vision Model Call
- Raw image buffer is sent to Hugging Face Inference API.

Model used: google/vit-base-patch16-224.

Content-Type: application/octet-stream.

- AI Image Analysis
- Model returns an array of labels with confidence scores.

Example labels: dog, grass, outdoor.

- Text Generation Logic
- Labels are extracted and combined into a readable sentence:

"This image likely contains: dog, grass, outdoor."

- Response to Client
- Backend sends structured JSON response.
- Frontend replaces loading animation with AI-generated text.

<!-- 📌 API Endpoint -->

POST /api/imageToText

<!-- 📥 Request -->

Content-Type: multipart/form-data

Field: image

curl -X POST http://localhost:3000/api/imageToText \
  -F "image=@photo.jpg"

<!-- 📤 Response (Success) -->
{
  "success": true,
  "text": "This image likely contains: dog, grass, outdoor."
}

<!-- ⚙️ Implementation -->

Model: google/vit-base-patch16-224

Provider: Hugging Face Inference API

Upload: Multer (memory storage)

Processing: Vision labels → sentence composition

Text → [stabilityai/stable-diffusion-xl-base-1.0]      **→ Generated Image**
      *Platform*: Hugging Face Inference API
      *Company*: Stability AI
      *Task*: Text → Image generation
      *Type*: Diffusion / Generative AI
      *Output*: High-quality, realistic images
          ↓
      [google/vit-base-patch16-224]                    **→ Image Analysis**
      *Platform*: Hugging Face Inference API
      *Company*: Google
      *Task*: Image → Understanding / Features
      *Type*: Vision Transformer / Computer Vision
      *Output*: Image features, classification, analysis