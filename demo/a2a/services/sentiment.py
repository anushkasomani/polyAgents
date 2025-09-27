import os, requests, pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

CP_API = "https://cryptopanic.com/api/developer/v2/posts/"

def fetch_headlines(auth_token: str | None) -> pd.DataFrame:
    if not auth_token:
        return pd.DataFrame(columns=["time","title","assets"])
    r = requests.get(CP_API, params={
        "auth_token": auth_token, "kind": "news",
        "filter": "rising|hot|bullish|bearish", "public": "true"
    }, timeout=20)
    r.raise_for_status()
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
