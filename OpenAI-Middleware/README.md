<!-- Set up environment variables: -->

--> **Create a .env file in the root directory**

PORT=PORT

# **Encryption algorithm**
CRYPTO_ALGORITHM=aes-256-cbc

SC_CRYPTO_SECRET_KEY=SC_CRYPTO_SECRET_KEY  
SC_CRYPTO_IV=SC_CRYPTO_KEY             

# **GroqAI API Key**
SC_GROQ_API_KEY_ENCRYPTED=SC_GROQ_API_KEY_ENCRYPTED

  **OR**

# **OpenAI API key** 
SC_OPENAI_API_KEY_ENCRYPTED=SC_OPENAI_API_KEY_ENCRYPTED

# **For TC (Theoretical Content)**
TC_CRYPTO_SECRET_KEY=TC_CRYPTO_SECRET_KEY
TC_CRYPTO_IV=TC_CRYPTO_IV
TC_OPENAI_API_KEY_ENCRYPTED=TC_OPENAI_API_KEY_ENCRYPTED

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
