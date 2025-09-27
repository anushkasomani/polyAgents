# from dotenv import load_dotenv
# import os
# import json
# import google.generativeai as genai

# load_dotenv()

# api_key ='AIzaSyBgYdv3VhYoKX4tnw6kKiRqh1CAKh_bBY8'
# if not api_key:
#     raise RuntimeError("GOOGLE_API_KEY not found in environment")

# def build_plan_with_gemini(user_text: str) -> dict:
#     """
#     Use Gemini to generate a structured Plan JSON.
#     Returns a dict of the form:
#       {"services": [{"service": "name", "description": "..."}, ...]}
#     """
#     genai.configure(api_key=api_key)

#     prompt = f"""Analyse the user text and return a JSON plan that lists one or more services the user requests.
# Return ONLY valid JSON with this schema:

# {{
#   "services": [
#     {{
#       "service": "service name",
#       "description": "service description"
#     }}
#   ]
# }}

# Example input:
# "I want ohlcv data for BTC and ETH and also get me the latest news on DOGE from reddit or x and tell me about this NFT or give me a rarity score on this NFT. Get me the weather prediction for tomorrow in London. And run backtest on Solana/Arbitrum if the sentiment is good."

# Example output:
# {{
#   "services": [
#     {{ "service": "ohlcv", "description": "get ohlcv data for BTC and ETH" }},
#     {{ "service": "news",  "description": "get the latest news on DOGE from reddit or x" }},
#     {{ "service": "nft",   "description": "give me a rarity score on this NFT" }},
#     {{ "service": "weather","description": "get the weather prediction for tomorrow in London" }},
#     {{ "service": "backtest","description": "run backtest on Solana/Arbitrum if the sentiment is good" }}
#   ]
# }}

# Now produce the JSON plan for this user text: {user_text}
# """

#     model = genai.GenerativeModel("gemini-2.0-flash")

#     try:
#         response = model.generate_content(
#             [prompt],
#             generation_config={"response_mime_type": "application/json"}
#         )

#         raw_json = response.text  # Gemini response body
#         plan = json.loads(raw_json)
#         return plan

#     except Exception as e:
#         print(f"Gemini generation error: {e}")
#         return {"services": []}


# if __name__ == "__main__":
#     test_prompt = "trending token which broke out in 5m and their sentiments"
#     generated_plan = build_plan_with_gemini(test_prompt)
#     print("Test Prompt:")
#     print(test_prompt)
#     print("\nGenerated Plan:")
#     print(json.dumps(generated_plan, indent=2))

from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

load_dotenv()

api_key='AIzaSyCyie2IcFLNRhQZV1wU5r2j6gC6FWsb1d4'
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY not found in environment")

def build_plan_with_gemini(user_text: str) -> dict:
    """
    Use Gemini to generate a structured Plan JSON.
    Returns a dict of the form:
      {"services": [{"service": "name", "description": "..."}, ...]}
    """
    print("Configuring Gemini API...")
    genai.configure(api_key=api_key)
    print("API configured successfully")

    prompt = f"""Analyse the user text and return a JSON plan that lists one or more services the user requests.
Return ONLY valid JSON with this schema:

{{
  "services": [
    {{
      "service": "service name",
      "description": "service description"
    }}
  ]
}}

Example input:
"I want ohlcv data for BTC and ETH and also get me the latest news on DOGE from reddit or x and tell me about this NFT or give me a rarity score on this NFT. Get me the weather prediction for tomorrow in London. And run backtest on Solana/Arbitrum if the sentiment is good."

Example output:
{{
  "services": [
    {{ "service": "ohlcv", "description": "get ohlcv data for BTC and ETH" }},
    {{ "service": "news",  "description": "get the latest news on DOGE from reddit or x" }},
    {{ "service": "nft",   "description": "give me a rarity score on this NFT" }},
    {{ "service": "weather","description": "get the weather prediction for tomorrow in London" }},
    {{ "service": "backtest","description": "run backtest on Solana/Arbitrum if the sentiment is good" }}
  ]
}}

Now produce the JSON plan for this user text: {user_text}
"""

    print("Creating Gemini model...")
    model = genai.GenerativeModel("gemini-2.5-flash")
    print("Model created successfully")

    try:
        print("Sending request to Gemini...")
        response = model.generate_content(
            [prompt],
            generation_config={"response_mime_type": "application/json"}
        )
        print("Received response from Gemini")

        raw_json = response.text  # Gemini response body
        plan = json.loads(raw_json)
        return plan

    except Exception as e:
        print(f"Gemini generation error: {e}")
        return {"services": []}

# --- This is the new part for testing ---
if __name__ == "__main__":
    print("Starting script...")
    
    # Define a test prompt
    test_prompt = "Find me flight prices from New York to London for next month. Also, tell me the current time in Tokyo."
    
    print(f"Test prompt: {test_prompt}")
    print("Calling build_plan_with_gemini...")
    
    # Call the function with the test prompt
    generated_plan = build_plan_with_gemini(test_prompt)
    
    # Print the result
    print("Test Prompt:")
    print(test_prompt)
    print("\nGenerated Plan:")
    print(json.dumps(generated_plan, indent=2))

