#!/bin/bash

echo "🎮 INTERACTIVE X402 DEMO"
echo "========================"
echo "Type your requests and see the x402 flow in action!"
echo "Type 'quit' to exit"
echo ""

# Check if orchestrator is running
if ! curl -s http://localhost:5400/healthz > /dev/null; then
    echo "❌ Orchestrator not running on port 5400"
    echo "Please start it first: cd demo/a2a/orchestrator && PORT=5400 node server.js"
    exit 1
fi

echo "✅ Orchestrator is running!"
echo ""

while true; do
    echo -n "👤 You: "
    read user_input
    
    if [ "$user_input" = "quit" ]; then
        echo "👋 Goodbye!"
        break
    fi
    
    if [ -z "$user_input" ]; then
        continue
    fi
    
    echo ""
    echo "🤖 Processing: '$user_input'"
    echo ""
    
    # Step 1: Process request
    echo "📋 Step 1: Analyzing request and calculating price..."
    response=$(curl -s -X POST http://localhost:5400/process \
      -H 'Content-Type: application/json' \
      -d "{\"userText\": \"$user_input\"}")
    
    if echo "$response" | jq -e '.error' > /dev/null; then
        echo "❌ Error: $(echo "$response" | jq -r '.error')"
        echo ""
        continue
    fi
    
    plan=$(echo "$response" | jq -r '.plan')
    price=$(echo "$response" | jq -r '.price')
    services=$(echo "$response" | jq -r '.plan.services | length')
    
    echo "✅ Identified $services service(s):"
    echo "$response" | jq -r '.plan.services[] | "   • \(.service): \(.description)"'
    echo ""
    echo "💳 Price: $price wei"
    echo ""
    
    # Step 2: Execute services
    echo "📋 Step 2: Simulating payment and executing services..."
    result=$(curl -s -X POST http://localhost:5400/execute \
      -H 'Content-Type: application/json' \
      -d "{\"plan\": $plan}")
    
    echo "✅ Services executed successfully!"
    echo ""
    echo "📊 Results:"
    echo "$result" | jq -r '.results[] | "   • \(.service): \(.status) - \(.description)"'
    echo ""
    
    # Show sample data
    echo "📄 Sample data:"
    echo "$result" | jq -r '.results[] | select(.status == "success") | .result | to_entries[] | "   \(.key): \(.value)"' | head -5
    echo ""
    echo "=========================================="
    echo ""
done
