#!/usr/bin/env python3
import sys
import json
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sentiment import fetch_headlines, rolling_sentiment
    
    # Get crypto news from CryptoPanic
    # Try a few common env var names for the Cryptopanic token for convenience
    auth_token = "64b974a7af40cf7561155c98e5e3a0b9c7bd29d3" or os.environ.get("CRYPTOPANIC_TOKEN") or os.environ.get("CP_TOKEN")
    df_news = fetch_headlines(auth_token)
    
    # Get sentiment analysis
    sentiment_data = rolling_sentiment(df_news)
    
    # Convert to JSON-serializable format
    news_data = []
    for _, row in df_news.head(10).iterrows():  # Limit to 10 articles
        news_data.append({
            "title": row['title'],
            "time": row['time'].isoformat(),
            "assets": row['assets']
        })
    
    # Convert sentiment data
    sentiment_json = {}
    for asset, series in sentiment_data.items():
        sentiment_json[asset] = {
            "latest_score": float(series.iloc[-1]) if not series.empty else 0.0,
            "trend": "positive" if series.iloc[-1] > 0.1 else "negative" if series.iloc[-1] < -0.1 else "neutral"
        }
    
    result = {
        "service": "news",
        "description": "Get cryptocurrency news from CryptoPanic",
        "data": {
            "articles": news_data,
            "sentiment_analysis": sentiment_json,
            "total_articles": len(df_news)
        },
        "timestamp": "2025-09-27T13:22:41.189Z"
    }
    
    print(json.dumps(result, indent=2))
    
except Exception as e:
    error_result = {
        "service": "news", 
        "description": "Get cryptocurrency news from CryptoPanic",
        "error": str(e),
        "timestamp": "2025-09-27T13:22:41.189Z"
    }
    print(json.dumps(error_result, indent=2))
    sys.exit(1)
