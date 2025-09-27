#!/bin/bash

echo "=== Testing Text-to-Services x402 Orchestrator ==="
echo ""

# Test 1: News request
echo "Test 1: News request"
echo "Request: Get me news about BTC"
curl -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "Get me news about BTC"}' | jq .
echo ""

# Test 2: Weather request
echo "Test 2: Weather request"
echo "Request: What's the weather in London?"
curl -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "What'\''s the weather in London?"}' | jq .
echo ""

# Test 3: Combined request
echo "Test 3: Combined request"
echo "Request: Get me news about BTC and ETH and weather in London"
curl -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "Get me news about BTC and ETH and weather in London"}' | jq .
echo ""

# Test 4: Execute services
echo "Test 4: Execute services"
echo "Executing news and weather services..."
curl -X POST http://localhost:5400/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "plan": {
      "services": [
        {"service": "news", "description": "Get cryptocurrency news"},
        {"service": "weather", "description": "Get weather information"}
      ]
    }
  }' | jq .
echo ""

echo "=== All tests completed! ==="
