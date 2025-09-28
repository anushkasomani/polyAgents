#!/usr/bin/env python3
"""
Python Services Server with x402 Payment Protocol Integration
Direct integration of Python services with frontend via HTTP/x402
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests

# Import your Python services
from geckoterminal import trending_pools, get_token, pool_ohlcv
from sentiment import fetch_headlines, rolling_sentiment, sentiment_shock
# from ohlcv import *  # Import your OHLCV functions
# from oracle import *  # Import your Oracle functions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, exposed_headers=['X-PAYMENT-RESPONSE'])

# Configuration
PORT = int(os.getenv('PYTHON_SERVER_PORT', 5410))
FACILITATOR_URL = os.getenv('FACILITATOR_URL', 'http://localhost:5401')
PAY_TO_ADDRESS = os.getenv('PAY_TO_ADDRESS', '0xPayToAddress')
USDC_CONTRACT = os.getenv('USDC_CONTRACT', '0xAmoyUSDC')

# Service registry
SERVICES = {
    'geckoterminal': {
        'functions': ['trending_pools', 'get_token', 'pool_ohlcv'],
        'description': 'GeckoTerminal trending pools and token data'
    },
    'sentiment': {
        'functions': ['fetch_headlines', 'rolling_sentiment', 'sentiment_shock'],
        'description': 'Cryptocurrency news sentiment analysis'
    },
    'ohlcv': {
        'functions': ['get_price_data', 'get_historical_data'],
        'description': 'OHLCV price data from exchanges'
    },
    'oracle': {
        'functions': ['get_chainlink_price', 'get_oracle_data'],
        'description': 'Chainlink oracle price feeds'
    }
}

def build_payment_requirements(resource_url: str) -> Dict[str, Any]:
    """Build x402 payment requirements"""
    return {
        "scheme": "exact",
        "network": "polygon-amoy",
        "resource": resource_url,
        "description": "Python service execution",
        "mimeType": "application/json",
        "payTo": PAY_TO_ADDRESS,
        "maxAmountRequired": "1000",  # 0.001 USDC
        "maxTimeoutSeconds": 120,
        "asset": USDC_CONTRACT,
        "extra": {"name": "USDC", "version": "2"}
    }

def verify_payment(payment_header: str) -> Dict[str, Any]:
    """Verify payment with facilitator"""
    try:
        response = requests.post(f"{FACILITATOR_URL}/verify", 
                               json={"paymentHeader": payment_header},
                               timeout=10)
        return response.json()
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        return {"isValid": False, "error": str(e)}

def settle_payment(payment_header: str) -> Dict[str, Any]:
    """Settle payment with facilitator"""
    try:
        response = requests.post(f"{FACILITATOR_URL}/settle",
                               json={"paymentHeader": payment_header},
                               timeout=30)
        return response.json()
    except Exception as e:
        logger.error(f"Payment settlement failed: {e}")
        return {"success": False, "error": str(e)}

def generate_plan(user_text: str) -> Dict[str, Any]:
    """Custom plan generation logic (replacing Gemini)"""
    text_lower = user_text.lower()
    services = []
    
    # GeckoTerminal service detection
    if any(keyword in text_lower for keyword in ['trending', 'pools', 'token', 'breakout', '5m', '15m', 'gecko']):
        services.append({
            "service": "geckoterminal",
            "description": "Get trending pools and token data",
            "function": "trending_pools",
            "params": {"duration": "5m", "page": 1}
        })
    
    # Sentiment service detection
    if any(keyword in text_lower for keyword in ['news', 'sentiment', 'headlines', 'btc', 'eth', 'crypto']):
        services.append({
            "service": "sentiment", 
            "description": "Get cryptocurrency news and sentiment analysis",
            "function": "fetch_headlines",
            "params": {"auth_token": os.getenv('CRYPTOPANIC_TOKEN')}
        })
    
    # OHLCV service detection
    if any(keyword in text_lower for keyword in ['price', 'ohlcv', 'chart', 'data', 'historical']):
        services.append({
            "service": "ohlcv",
            "description": "Get OHLCV price data",
            "function": "get_price_data", 
            "params": {"symbol": "BTC"}
        })
    
    # Oracle service detection
    if any(keyword in text_lower for keyword in ['oracle', 'chainlink', 'feed', 'price feed']):
        services.append({
            "service": "oracle",
            "description": "Get Chainlink oracle price feeds",
            "function": "get_chainlink_price",
            "params": {"symbol": "BTC"}
        })
    
    return {"services": services}

def calculate_price(services: List[Dict[str, Any]]) -> int:
    """Calculate price based on services"""
    base_price = 1000  # 0.001 USDC
    
    if len(services) == 1:
        return base_price
    elif len(services) == 2:
        return int(base_price * 1.8)  # 10% discount
    elif len(services) == 3:
        return int(base_price * 2.5)  # 17% discount
    else:
        return int(len(services) * base_price * 0.9)  # 10% discount

@app.route('/healthz', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "ok": True,
        "services": list(SERVICES.keys()),
        "facilitator": FACILITATOR_URL,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/process', methods=['POST'])
def process_request():
    """Process user text and return payment requirements"""
    try:
        data = request.get_json()
        user_text = data.get('userText', '')
        
        if not user_text:
            return jsonify({"error": "userText is required"}), 400
        
        logger.info(f"Processing request: {user_text}")
        
        # Generate plan
        plan = generate_plan(user_text)
        logger.info(f"Generated plan: {plan}")
        
        if not plan.get('services'):
            return jsonify({"error": "No services identified in user text"}), 400
        
        # Calculate price
        price = calculate_price(plan['services'])
        logger.info(f"Calculated price: {price}")
        
        # Return 402 with payment requirements
        resource_url = f"http://localhost:{PORT}/execute"
        accepts = [build_payment_requirements(resource_url)]
        accepts[0]["maxAmountRequired"] = str(price)
        
        return jsonify({
            "accepts": accepts,
            "plan": plan,
            "price": price,
            "message": "Payment required to execute services"
        }), 402
        
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/execute', methods=['POST'])
def execute_services():
    """Execute services after payment verification"""
    payment_header = request.headers.get('X-PAYMENT')
    
    if not payment_header:
        resource_url = f"http://localhost:{PORT}/execute"
        accepts = [build_payment_requirements(resource_url)]
        return jsonify({"accepts": accepts}), 402
    
    try:
        # Verify payment
        verify_result = verify_payment(payment_header)
        if not verify_result.get('isValid'):
            logger.error(f"Payment verification failed: {verify_result}")
            return jsonify({"error": "Payment verification failed"}), 402
        
        # Get plan from request
        data = request.get_json()
        plan = data.get('plan', {})
        services = plan.get('services', [])
        
        logger.info(f"Executing services: {services}")
        
        # Execute services
        results = []
        for service_config in services:
            service_name = service_config['service']
            function_name = service_config['function']
            params = service_config.get('params', {})
            
            try:
                result = execute_service_function(service_name, function_name, params)
                results.append({
                    "service": service_name,
                    "status": "success",
                    "result": result,
                    "description": service_config['description']
                })
            except Exception as e:
                logger.error(f"Service {service_name} failed: {e}")
                results.append({
                    "service": service_name,
                    "status": "error",
                    "error": str(e),
                    "description": service_config['description']
                })
        
        # Settle payment
        settle_result = settle_payment(payment_header)
        
        # Prepare response
        response_data = {
            "success": True,
            "results": results,
            "plan": plan,
            "executedAt": datetime.now().isoformat()
        }
        
        # Add payment response header
        if settle_result.get('success'):
            payment_response = {
                "success": True,
                "transaction": settle_result.get('txHash'),
                "network": "polygon-amoy",
                "payer": settle_result.get('payer')
            }
        else:
            payment_response = {
                "success": False,
                "error": settle_result.get('error')
            }
        
        response = jsonify(response_data)
        response.headers['X-PAYMENT-RESPONSE'] = json.dumps(payment_response)
        
        return response
        
    except Exception as e:
        logger.error(f"Error executing services: {e}")
        return jsonify({"error": "Internal server error"}), 500

def execute_service_function(service_name: str, function_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute specific service function"""
    
    if service_name == 'geckoterminal':
        if function_name == 'trending_pools':
            duration = params.get('duration', '5m')
            page = params.get('page', 1)
            pools = trending_pools(duration=duration, page=page)
            return {
                "service": "geckoterminal",
                "function": "trending_pools",
                "data": {
                    "trending_pools": pools[:10],  # Top 10
                    "duration": duration,
                    "count": len(pools)
                },
                "timestamp": datetime.now().isoformat()
            }
        elif function_name == 'get_token':
            token_id = params.get('token_id')
            if token_id:
                token_data = get_token(token_id)
                return {
                    "service": "geckoterminal",
                    "function": "get_token",
                    "data": token_data,
                    "timestamp": datetime.now().isoformat()
                }
    
    elif service_name == 'sentiment':
        if function_name == 'fetch_headlines':
            auth_token = params.get('auth_token')
            df = fetch_headlines(auth_token)
            sentiment_data = rolling_sentiment(df)
            
            return {
                "service": "sentiment",
                "function": "fetch_headlines",
                "data": {
                    "headlines": df.to_dict('records') if not df.empty else [],
                    "sentiment": {k: v.to_dict() for k, v in sentiment_data.items()},
                    "count": len(df)
                },
                "timestamp": datetime.now().isoformat()
            }
    
    # Add more service functions as needed
    # elif service_name == 'ohlcv':
    # elif service_name == 'oracle':
    
    raise ValueError(f"Unknown service function: {service_name}.{function_name}")

@app.route('/services', methods=['GET'])
def list_services():
    """List available services"""
    return jsonify({
        "services": SERVICES,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info(f"Starting Python Services Server on port {PORT}")
    logger.info(f"Facilitator URL: {FACILITATOR_URL}")
    logger.info(f"Available services: {list(SERVICES.keys())}")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
