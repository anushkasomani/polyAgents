import os, requests, pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

CP_API = "https://cryptopanic.com/api/developer/v2/posts/"

def fetch_headlines(auth_token: str | None) -> pd.DataFrame:
    if not auth_token:
        return pd.DataFrame(columns=["time","title","assets"])
    params = {"auth_token": auth_token, "kind": "news",
              "filter": "rising|hot|bullish|bearish", "public": "true"}
    # Debug: record what we're sending and attempt the request
    try:
        r = requests.get(CP_API, params=params, timeout=20)
    except Exception as e:
        print(f"fetch_headlines: requests.get failed: {e}")
        return pd.DataFrame(columns=["time","title","assets"])
    print(f"fetch_headlines: url={r.url} status={r.status_code}")
    try:
        r.raise_for_status()
    except Exception as e:
        print(f"fetch_headlines: non-200 response: {e} - body={r.text[:500]}")
        return pd.DataFrame(columns=["time","title","assets"])
    items = r.json().get("results", [])
    rows = []
    for it in items:
        ts = pd.to_datetime(it["published_at"], utc=True)
        title = it.get("title") or ""
        #TODO SUPPORT MORE ASSETS 
        assets = []
        if "bitcoin" in title.lower(): assets.append("BTC")
        if "ethereum" in title.lower(): assets.append("ETH")
        if "solana" in title.lower(): assets.append("SOL")
        # assets = [t["code"].upper() for t in it.get("currencies", []) if t.get("code")]
        rows.append({"time": ts, "title": title, "assets": assets})
    return pd.DataFrame(rows)

def rolling_sentiment(df_news: pd.DataFrame) -> dict[str, pd.Series]:
    sid = SentimentIntensityAnalyzer()
    rows = []
    for _, r in df_news.iterrows():
        s = sid.polarity_scores(r["title"])["compound"]
        for a in (r["assets"] or []):
            rows.append({"time": r["time"], "asset": a, "score": s})
    if not rows: return {}
    sdf = pd.DataFrame(rows).set_index("time").sort_index()
    out = {}
    for a, g in sdf.groupby("asset"):
        out[a] = g["score"].rolling("6H").mean().clip(-1,1)
    return out

def sentiment_shock(series: pd.Series, hours: int = 24, threshold: float = 0.5) -> bool:
    if series is None or series.empty: return False
    recent = series.dropna().last(f"{hours}H")
    if recent.empty: return False
    return (recent.max() - recent.min()) > threshold


def main():
    """Simple debug entrypoint to fetch headlines, compute rolling sentiment, and print a short report.

    Uses the CRYPTOPANIC_TOKEN environment variable if present. Safe to run without a token
    (will return empty results).
    """
    # Try a few common env var names for the Cryptopanic token for convenience
    token ="64b974a7af40cf7561155c98e5e3a0b9c7bd29d3" or os.environ.get("CRYPTOPANIC_TOKEN") or os.environ.get("CP_TOKEN")
    print("Env tokens present:", {"CP_AUTH_TOKEN": bool(os.environ.get("CP_AUTH_TOKEN")),
                                  "CRYPTOPANIC_TOKEN": bool(os.environ.get("CRYPTOPANIC_TOKEN")),
                                  "CP_TOKEN": bool(os.environ.get("CP_TOKEN"))})
    print("Fetching headlines (Cryptopanic) - token present:" , bool(token))
    df = fetch_headlines(token)
    print(f"Headlines fetched: {len(df)} rows")
    if not df.empty:
        print(df.head(5).to_string(index=False))

    s = rolling_sentiment(df)
    print(f"Assets with sentiment series: {list(s.keys())}")
    for a, ser in s.items():
        print(f"-- {a}: latest={ser.dropna().iloc[-1] if not ser.dropna().empty else 'n/a'}, length={len(ser.dropna())}")
        shock = sentiment_shock(ser, hours=24, threshold=0.5)
        print(f"   shock (24h,0.5): {shock}")


if __name__ == '__main__':
    main()