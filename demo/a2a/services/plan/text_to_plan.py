from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

# --- Initialization and Configuration (runs only once) ---

# Load environment variables from a .env file
load_dotenv()

# Get API key from environment and configure the SDK.
# This is more secure than hardcoding the key.
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("Error: GOOGLE_API_KEY is not set in the environment variables.")
    
print("✅ Gemini API configured successfully.")
genai.configure(api_key=api_key)

# Create the model instance once to be reused.
# Updated to a current and efficient model.
print("🧠 Initializing Gemini model: gemini-1.5-flash-latest")
model = genai.GenerativeModel("gemini-1.5-flash-latest")


def build_plan_with_gemini(user_text: str) -> dict:
    """
    Uses Gemini to generate a structured plan from user text.

    Args:
        user_text: The natural language request from the user.

    Returns:
        A dictionary structured as the plan, or an empty plan on failure.
    """
    # A clear, structured prompt for the model to follow.
    prompt = f"""
    Analyze the user's request and generate a JSON object that breaks down the request into a list of services.

    **Instructions:**
    1. The output must be a valid JSON object.
    2. The root of the object must be a key named "services".
    3. The "services" key must contain an array of objects.
    4. Each object in the array must have two keys: "service" (a short, one-word identifier) and "description" (a summary of that part of the request).

    **Example Input:**
    "I want ohlcv data for BTC and ETH and also get me the latest news on DOGE from reddit or x. Get me the weather prediction for tomorrow in London."

    **Example Output:**
    {{
      "services": [
        {{ "service": "ohlcv", "description": "get ohlcv data for BTC and ETH" }},
        {{ "service": "news",  "description": "get the latest news on DOGE from reddit or x" }},
        {{ "service": "weather","description": "get the weather prediction for tomorrow in London" }}
      ]
    }}

    ---
    **User Request to Analyze:**
    "{user_text}"
    ---
    """

    try:
        print(f"\n🔄 Sending request to Gemini...")
        response = model.generate_content(
            prompt,
            # Ensures the model output is formatted as a JSON string
            generation_config={"response_mime_type": "application/json"}
        )
        print("✅ Received valid response.")
        
        # The response.text is the clean JSON string from the model
        plan_data = json.loads(response.text)
        return plan_data

    except Exception as e:
        print(f"❌ An error occurred during Gemini generation: {e}")
        # Return an empty plan as a safe fallback
        return {"services": []}

# --- Testing Block ---

if __name__ == "__main__":
    print("\n🚀 Starting Gemini Plan Builder Test...")
    
    test_prompt = "Find me flight prices from New York to London for next month. Also, tell me the current time in Tokyo."
    
    print(f"🗣️  Test Prompt: \"{test_prompt}\"")
    
    # Call the function with the test prompt
    generated_plan = build_plan_with_gemini(test_prompt)
    
    # Print the final result in a readable format
    print("\n📋 Generated Plan:")
    print(json.dumps(generated_plan, indent=2))