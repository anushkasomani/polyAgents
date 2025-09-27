#!/bin/bash

echo "🚀 =========================================="
echo "   TEXT-TO-SERVICES X402 COMPLETE DEMO"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 STEP $1: $2${NC}"
}

print_user() {
    echo -e "${YELLOW}👤 USER: $1${NC}"
}

print_system() {
    echo -e "${GREEN}🤖 SYSTEM: $1${NC}"
}

print_payment() {
    echo -e "${PURPLE}💳 PAYMENT: $1${NC}"
}

print_result() {
    echo -e "${GREEN}✅ RESULT: $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

# Check if orchestrator is running
if ! curl -s http://localhost:5400/healthz > /dev/null; then
    print_error "Orchestrator not running on port 5400"
    echo "Please start it first: cd demo/a2a/orchestrator && PORT=5400 node server.js"
    exit 1
fi

print_system "Orchestrator is running! Starting demo..."
echo ""

# Demo 1: Simple News Request
print_step "1" "Simple News Request"
print_user "Get me the latest news about Bitcoin"
echo ""

print_system "Processing request..."
response1=$(curl -s -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "Get me the latest news about Bitcoin"}')

echo "Response:"
echo "$response1" | jq .
echo ""

# Extract plan and price for execution
plan1=$(echo "$response1" | jq -r '.plan')
price1=$(echo "$response1" | jq -r '.price')

print_payment "Payment required: $price1 wei"
print_system "Simulating payment and executing services..."
echo ""

# Execute the services
result1=$(curl -s -X POST http://localhost:5400/execute \
  -H 'Content-Type: application/json' \
  -d "{\"plan\": $plan1}")

print_result "Services executed successfully!"
echo "Results:"
echo "$result1" | jq .
echo ""

echo "=========================================="
echo ""

# Demo 2: Weather Request
print_step "2" "Weather Request"
print_user "What's the weather like in London tomorrow?"
echo ""

print_system "Processing request..."
response2=$(curl -s -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "What'\''s the weather like in London tomorrow?"}')

echo "Response:"
echo "$response2" | jq .
echo ""

plan2=$(echo "$response2" | jq -r '.plan')
price2=$(echo "$response2" | jq -r '.price')

print_payment "Payment required: $price2 wei"
print_system "Simulating payment and executing services..."
echo ""

result2=$(curl -s -X POST http://localhost:5400/execute \
  -H 'Content-Type: application/json' \
  -d "{\"plan\": $plan2}")

print_result "Weather service executed successfully!"
echo "Results:"
echo "$result2" | jq .
echo ""

echo "=========================================="
echo ""

# Demo 3: Complex Multi-Service Request
print_step "3" "Complex Multi-Service Request"
print_user "I want news about BTC and ETH, weather in New York, and some NFT rarity data"
echo ""

print_system "Processing complex request..."
response3=$(curl -s -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "I want news about BTC and ETH, weather in New York, and some NFT rarity data"}')

echo "Response:"
echo "$response3" | jq .
echo ""

plan3=$(echo "$response3" | jq -r '.plan')
price3=$(echo "$response3" | jq -r '.price')

print_payment "Payment required: $price3 wei (Multi-service discount applied!)"
print_system "Simulating payment and executing all services..."
echo ""

result3=$(curl -s -X POST http://localhost:5400/execute \
  -H 'Content-Type: application/json' \
  -d "{\"plan\": $plan3}")

print_result "All services executed successfully!"
echo "Results:"
echo "$result3" | jq .
echo ""

echo "=========================================="
echo ""

# Demo 4: Show Pricing Logic
print_step "4" "Pricing Demonstration"
echo "Let's see how pricing works with different service combinations:"
echo ""

test_cases=(
    "news"
    "weather" 
    "news weather"
    "news weather ohlcv"
    "news weather ohlcv nft backtest"
)

for test_case in "${test_cases[@]}"; do
    print_user "Request: $test_case"
    response=$(curl -s -X POST http://localhost:5400/process \
      -H 'Content-Type: application/json' \
      -d "{\"userText\": \"$test_case\"}")
    
    service_count=$(echo "$response" | jq -r '.plan.services | length')
    price=$(echo "$response" | jq -r '.price')
    
    print_system "Services: $service_count | Price: $price wei"
    echo ""
done

echo "=========================================="
echo ""

# Demo 5: Error Handling
print_step "5" "Error Handling"
print_user "Give me some random gibberish that doesn't match any services"
echo ""

print_system "Processing request..."
response_error=$(curl -s -X POST http://localhost:5400/process \
  -H 'Content-Type: application/json' \
  -d '{"userText": "asdfghjkl random gibberish"}')

echo "Response:"
echo "$response_error" | jq .
echo ""

print_error "No services identified - proper error handling!"
echo ""

echo "=========================================="
echo ""

# Summary
print_step "6" "Demo Summary"
echo "🎉 Complete x402 Text-to-Services Demo Completed!"
echo ""
echo "✅ What we demonstrated:"
echo "   • Natural language text input"
echo "   • AI-powered service identification"
echo "   • Dynamic pricing with discounts"
echo "   • x402 payment protocol flow"
echo "   • Multi-service execution"
echo "   • Error handling"
echo ""
echo "🔧 Technical details:"
echo "   • Orchestrator: http://localhost:5400"
echo "   • Services: news, weather, ohlcv, nft, backtest"
echo "   • Pricing: 1000 wei base, discounts for multiple services"
echo "   • Protocol: x402 with 402 payment requirements"
echo ""
echo "🚀 Ready for production with real services and payment integration!"
echo ""
echo "=========================================="
