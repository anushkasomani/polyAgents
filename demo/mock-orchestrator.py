#!/usr/bin/env python3

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class MockOrchestratorHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            response = {
                "status": "healthy",
                "timestamp": time.time(),
                "services": ["news", "weather", "sentiment", "ohlcv", "backtest", "oracle", "geckoterminal"]
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/process':
            self.handle_process()
        elif self.path == '/execute':
            self.handle_execute()
        else:
            self.send_response(404)
            self.end_headers()

    def handle_process(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            user_text = data.get('userText', '')
            
            # Simple intent parsing
            services = []
            lower_text = user_text.lower()
            
            if any(word in lower_text for word in ['news', 'btc', 'eth', 'crypto', 'bitcoin', 'ethereum']):
                services.append({"service": "news", "description": "Get cryptocurrency news", "price": 0.1})
            
            if any(word in lower_text for word in ['weather', 'forecast', 'london', 'tokyo', 'temperature']):
                services.append({"service": "weather", "description": "Get weather information", "price": 0.05})
            
            if any(word in lower_text for word in ['sentiment', 'mood', 'analysis', 'feeling']):
                services.append({"service": "sentiment", "description": "Get market sentiment analysis", "price": 0.15})
            
            if any(word in lower_text for word in ['price', 'ohlcv', 'chart', 'data', 'eth', 'btc']):
                services.append({"service": "ohlcv", "description": "Get OHLCV price data", "price": 0.2})
            
            if any(word in lower_text for word in ['backtest', 'strategy', 'test', 'simulation']):
                services.append({"service": "backtest", "description": "Run trading strategy backtest", "price": 0.5})
            
            if any(word in lower_text for word in ['oracle', 'chainlink', 'feed', 'price feed']):
                services.append({"service": "oracle", "description": "Get oracle price feeds", "price": 0.25})
            
            if any(word in lower_text for word in ['gecko', 'trending', 'pools', 'defi', 'dex']):
                services.append({"service": "geckoterminal", "description": "Get DeFi analytics", "price": 0.3})
            
            if not services:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {"error": "No services identified in user text"}
                self.wfile.write(json.dumps(error_response).encode())
                return
            
            # Calculate total price
            total_price = sum(service['price'] for service in services)
            
            # Create 402 Payment Required response
            self.send_response(402)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "accepts": [{
                    "scheme": "exact",
                    "network": "polygon-amoy",
                    "resource": "http://localhost:5400/process",
                    "description": "Service execution",
                    "mimeType": "application/json",
                    "payTo": "0x19221F5916660EDfDD2d64675fFE2f20fA6f767E",
                    "maxAmountRequired": str(int(total_price * 1000000)),  # Convert to wei
                    "maxTimeoutSeconds": 120,
                    "asset": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
                    "extra": {
                        "name": "USDC",
                        "version": "2"
                    }
                }],
                "plan": {
                    "services": services
                },
                "price": total_price,
                "message": "Payment required to execute services"
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())

    def handle_execute(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            plan = data.get('plan', {})
            services = plan.get('services', [])
            
            # Simulate service execution
            results = []
            for service in services:
                service_name = service.get('service', '')
                service_data = self.generate_mock_data(service_name)
                
                result = {
                    "service": service_name,
                    "description": service.get('description', ''),
                    "data": service_data,
                    "success": True
                }
                results.append(result)
                
                # Simulate processing time
                time.sleep(0.5)
            
            # Calculate total cost
            total_cost = sum(service.get('price', 0) for service in services)
            
            response = {
                "success": True,
                "results": results,
                "totalCost": total_cost,
                "timestamp": time.time()
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())

    def generate_mock_data(self, service_name):
        """Generate mock data for different services"""
        if service_name == 'news':
            return {
                "headlines": [
                    "Bitcoin reaches new all-time high",
                    "Ethereum 2.0 upgrade successful",
                    "DeFi protocols see increased adoption"
                ],
                "sentiment": "bullish",
                "timestamp": time.time()
            }
        elif service_name == 'weather':
            return {
                "location": "London",
                "temperature": "15°C",
                "condition": "Partly cloudy",
                "humidity": "65%",
                "timestamp": time.time()
            }
        elif service_name == 'sentiment':
            return {
                "overall_sentiment": "positive",
                "confidence": 0.85,
                "social_media_sentiment": "bullish",
                "news_sentiment": "neutral",
                "timestamp": time.time()
            }
        elif service_name == 'ohlcv':
            return {
                "symbol": "BTC/USD",
                "open": 45000,
                "high": 46000,
                "low": 44000,
                "close": 45500,
                "volume": 1000000,
                "timestamp": time.time()
            }
        elif service_name == 'backtest':
            return {
                "strategy": "Moving Average Crossover",
                "total_return": "12.5%",
                "max_drawdown": "3.2%",
                "sharpe_ratio": 1.8,
                "win_rate": "65%",
                "timestamp": time.time()
            }
        elif service_name == 'oracle':
            return {
                "price_feeds": {
                    "BTC/USD": 45500,
                    "ETH/USD": 3200,
                    "LINK/USD": 15.5
                },
                "confidence": 0.99,
                "timestamp": time.time()
            }
        elif service_name == 'geckoterminal':
            return {
                "trending_pools": [
                    {"name": "ETH/USDC", "volume_24h": 5000000},
                    {"name": "BTC/USDC", "volume_24h": 3000000}
                ],
                "defi_tvl": 50000000,
                "timestamp": time.time()
            }
        else:
            return {
                "message": f"Mock data for {service_name}",
                "timestamp": time.time()
            }

    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server():
    server = HTTPServer(('localhost', 5400), MockOrchestratorHandler)
    print("🚀 Mock Orchestrator running on http://localhost:5400")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /process - Process user intent")
    print("  POST /execute - Execute services")
    print("🧪 Ready to test intent processing!")
    print("Try: curl -X POST http://localhost:5400/process -H 'Content-Type: application/json' -d '{\"userText\": \"Get BTC news and sentiment\"}'")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
