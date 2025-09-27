from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

load_dotenv()

api_key ='AIzaSyBgYdv3VhYoKX4tnw6kKiRqh1CAKh_bBY8'
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY not found in environment")

def build_plan_with_gemini(user_text: str) -> dict:
    """
    Use Gemini to generate a structured Plan JSON.
    Returns a dict of the form:
      {"services": [{"service": "name", "description": "..."}, ...]}
    """
    genai.configure(api_key=api_key)

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

    model = genai.GenerativeModel("gemini-2.0-flash")

    try:
        response = model.generate_content(
            [prompt],
            generation_config={"response_mime_type": "application/json"}
        )

        raw_json = response.text  # Gemini response body
        plan = json.loads(raw_json)
        return plan

    except Exception as e:
        print(f"Gemini generation error: {e}")
        return {"services": []}
