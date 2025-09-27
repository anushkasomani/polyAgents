#!/usr/bin/env python3
import sys
import json
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from geckoterminal import trending_pools
    
    # Get trending pools
    pools = trending_pools(duration="5m", page=1)
    
    result = {
        "service": "geckoterminal",
        "description": "Get trending pools from GeckoTerminal",
        "data": {
            "trending_pools": pools[:5],  # Limit to first 5 pools
            "count": len(pools)
        },
        "timestamp": "2025-09-27T13:22:41.189Z"
    }
    
    print(json.dumps(result, indent=2))
    
except Exception as e:
    error_result = {
        "service": "geckoterminal", 
        "description": "Get trending pools from GeckoTerminal",
        "error": str(e),
        "timestamp": "2025-09-27T13:22:41.189Z"
    }
    print(json.dumps(error_result, indent=2))
    sys.exit(1)


