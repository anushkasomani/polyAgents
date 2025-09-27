import requests
import os
from typing import List, Dict, Any, Optional
import sys
from datetime import datetime

BASE = os.getenv("GECKOTERMINAL_API", "https://api.geckoterminal.com/api/v2")
API_VERSION_HEADER = "application/json;version=20230302"


def _get(url: str, params: dict | None = None) -> dict:
    headers = {"Accept": API_VERSION_HEADER}
    resp = requests.get(url, params=params or {}, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def trending_pools(duration: str = "5m", page: int = 1, include: str = "base_token,quote_token") -> List[Dict[str, Any]]:
    """Call /networks/trending_pools to get trending pools across networks.
    duration: one of 5m,1h,6h,24h
    Returns list of pool objects (raw JSON 'data' entries).
    """
    url = f"{BASE}/networks/trending_pools"
    params = {"duration": duration, "page": page, "include": include}
    j = _get(url, params=params)
    return j.get("data", [])


def get_token(token_id: str) -> Optional[Dict[str, Any]]:
    """Fetch token metadata by GeckoTerminal token id (eg. 'bsc_0x...')."""
    try:
        url = f"{BASE}/tokens/{token_id}"
        j = _get(url)
        return j.get("data", {}).get("attributes")
    except Exception:
        return None


def pool_ohlcv(network: str, pool_address: str, timeframe: str = "5m") -> Dict[str, Any]:
    """Fetch pool OHLCV from GeckoTerminal: /networks/{network}/pools/{pool_address}/ohlcv/{timeframe}
    Returns raw JSON — caller must interpret structure.
    """
    url = f"{BASE}/networks/{network}/pools/{pool_address}/ohlcv/{timeframe}"
    return _get(url)

if __name__ == "__main__":
    try:
        # Get trending pools for 15m duration
        pools = trending_pools(duration="5m", page=1)
        
        # Format the response
        result = {
            "service": "geckoterminal",
            "description": "Get trending pools from GeckoTerminal",
            "data": {
                "trending_pools": pools[:10],  # Limit to top 10
                "duration": "15m",
                "count": len(pools)
            },
            "timestamp": datetime.now().isoformat() + "Z"
        }
        
        print(json.dumps(result, indent=2))
    except Exception as e:
        # Fallback with mock data if API fails
        print(f"\n--- AN ERROR OCCURRED ---\n{e}\n-------------------------\n", file=sys.stderr)