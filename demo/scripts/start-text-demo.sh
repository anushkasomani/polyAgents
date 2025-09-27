#!/bin/bash

# Start Text-to-Services Demo
echo "Starting Text-to-Services x402 Demo..."

# Set environment variables
export GOOGLE_API_KEY=${GOOGLE_API_KEY:-"your-google-api-key"}
export FACILITATOR_URL=${FACILITATOR_URL:-"http://localhost:5401"}
export ADDRESS=${ADDRESS:-"0xPayToAddress"}
export AMOY_USDC_ADDRESS=${AMOY_USDC_ADDRESS:-"0xAmoyUSDC"}

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local dir=$3
    
    echo "Starting $service_name on port $port..."
    if [ -d "$dir" ]; then
        cd "$dir"
        if [ -f "package.json" ]; then
            npm install
            npm run build
            PORT=$port npm start &
            echo "$service_name started with PID $!"
        else
            echo "No package.json found in $dir"
        fi
        cd - > /dev/null
    else
        echo "Directory $dir not found"
    fi
}

# Start all services
echo "Starting services..."

# 1. Facilitator (if not already running)
echo "Checking facilitator..."
if ! curl -s http://localhost:5401/healthz > /dev/null; then
    echo "Please start the facilitator first on port 5401"
    echo "You can use: cd demo/a2a/facilitator-amoy && npm run dev"
fi

# 2. Orchestrator (main service)
start_service "Orchestrator" 5400 "a2a/orchestrator"

# 3. Use existing examples as services
echo "Using existing examples as services..."
echo "- News Service: Use examples/typescript/servers/advanced (port 5404)"
echo "- Weather Service: Use examples/typescript/servers/express (port 5405)"

echo ""
echo "Demo started! Services running on:"
echo "- Orchestrator: http://localhost:5400"
echo "- Use existing examples as services:"
echo "  - Advanced server: examples/typescript/servers/advanced (port 5404)"
echo "  - Express server: examples/typescript/servers/express (port 5405)"
echo ""
echo "Test the orchestrator:"
echo "curl -X POST http://localhost:5400/process -H 'Content-Type: application/json' -d '{\"userText\": \"Get me news about BTC and weather in London\"}'"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; kill $(jobs -p); exit' INT
wait
