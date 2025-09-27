#!/usr/bin/env python3
import sys
import json
from text_to_plan import build_plan_with_gemini

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python3 text_to_plan_cli.py <user_text>"}))
        sys.exit(1)
    
    user_text = sys.argv[1]
    try:
        plan = build_plan_with_gemini(user_text)
        print(json.dumps(plan))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
