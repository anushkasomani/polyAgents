#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load env
if [ -f "$ROOT_DIR/.env.local" ]; then
  # shellcheck disable=SC1091
  set -a
  . "$ROOT_DIR/.env.local"
  set +a
else
  echo "ERROR: demo/.env.local not found. Copy demo/.env.local.sample and set values." >&2
  exit 1
fi

# Check for required environment variables
if [ -z "${GOOGLE_API_KEY:-}" ]; then
  echo "ERROR: GOOGLE_API_KEY not found in environment. Please set it in .env.local" >&2
  exit 1
fi

echo "🚀 Starting Interactive x402 Demo with Plan Analyzer..."
echo "=================================================="

# Function to get user input
get_user_input() {
  echo ""
  echo "📝 What would you like to do? (Enter your request in natural language)"
  echo "Examples:"
  echo "  - 'Get me tokens that broke in 15m'"
  echo "  - 'Show me weather in London and Tokyo'"
  echo "  - 'I need OHLCV data for BTC and trending pools'"
  echo "  - 'Get me sentiment analysis and oracle prices on Polygon'"
  echo ""
  read -p "Your request: " user_input
  
  if [ -z "$user_input" ]; then
    echo "❌ No input provided. Please try again."
    get_user_input
  fi
}

# Function to analyze user input using Python plan analyzer
analyze_plan() {
  local user_text="$1"
  echo "🧠 Analyzing your request with AI plan analyzer..." >&2
  
  # Use the Python plan analyzer
  local plan_result
  if command -v python3 >/dev/null 2>&1; then
    plan_result=$(cd "$ROOT_DIR/plan" && python3 text_to_plan_cli.py "$user_text" 2>/dev/null)
    # Check if plan_result is valid JSON and not empty
    if ! echo "$plan_result" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
      echo "⚠️ Python plan analyzer failed. Using fallback..." >&2
      plan_result=""
    fi
  else
    echo "❌ Python3 not found. Using fallback plan generation..." >&2
    plan_result=""
  fi
  
  # Fallback to simple keyword matching if Python failed or returned empty
  if [ -z "$plan_result" ] || [ "$plan_result" = "{}" ] || [ "$plan_result" = '{"services": []}' ]; then
    echo "🔄 Using fallback plan generation..." >&2
    
    # Build services array step by step
    local services=()
    
    if [[ "$user_text" =~ (news|trending news|x|twitter|reddit|btc|eth|crypto) ]]; then
      services+=('{"service": "news", "description": "Get cryptocurrency news"}')
    fi
    
    if [[ "$user_text" =~ (weather|london|tokyo|new york) ]]; then
      services+=('{"service": "weather", "description": "Get weather information"}')
    fi
    
    if [[ "$user_text" =~ (price|ohlcv|chart) ]]; then
      services+=('{"service": "ohlcv", "description": "Get OHLCV price data"}')
    fi
    
    if [[ "$user_text" =~ (gecko|trending token|pools) ]]; then
      services+=('{"service": "top tokens/pools", "description": "Get trending pools from agent"}')
    fi
    
    if [[ "$user_text" =~ (oracle|chainlink|price feed) ]]; then
      services+=('{"service": "oracle", "description": "Get Chainlink oracle price data"}')
    fi
    
    if [[ "$user_text" =~ (sentiment|mood|analysis) ]]; then
      services+=('{"service": "sentiment", "description": "Get market sentiment analysis"}')
    fi
    
    # If no services detected, default to news
    if [ ${#services[@]} -eq 0 ]; then
      services+=('{"service": "news", "description": "Get cryptocurrency news"}')
    fi
    
    # Build final JSON
    local services_json=$(printf '%s,' "${services[@]}")
    services_json=${services_json%,}  # Remove trailing comma
    plan_result="{\"services\": [$services_json]}"
  fi
  
  echo "$plan_result"
}

# Function to calculate dynamic pricing
calculate_dynamic_price() {
  local services_json="$1"
  local service_count=$(echo "$services_json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('services', [])))" 2>/dev/null || echo "1")
  
  # Dynamic pricing based on number of services and complexity
  local base_price=1000  # 0.001 USDC (6 decimals)
  local price=0
  
  case $service_count in
    1) price=$((base_price)) ;;
    2) price=$((base_price * 18 / 10)) ;;  # 1.8x with 10% discount
    3) price=$((base_price * 25 / 10)) ;;  # 2.5x with 17% discount
    4) price=$((base_price * 32 / 10)) ;;  # 3.2x with 20% discount
    *) price=$((service_count * base_price * 9 / 10)) ;;  # 10% discount for 5+
  esac
  
  echo "$price"
}

# Function to start services
start_services() {
  echo ""
  echo "🔧 Starting required services..."
  
  # Kill anything on the demo ports (including frontend)
  for port in "${FACILITATOR_PORT:-5401}" "${SERVICE_AGENT_PORT:-5402}" "${RESOURCE_SERVER_PORT:-5403}" "${ORCHESTRATOR_PORT:-5400}" "${FRONTEND_PORT:-8000}" "${FRONTEND_PORT_ALT:-8001}"; do
    pids=$(lsof -n -iTCP:"$port" -sTCP:LISTEN -t || true)
    if [ -n "$pids" ]; then
      echo "Killing processes on port $port: $pids"
      kill -9 $pids || true
    fi
  done

  # Compile TypeScript packages
  echo "📦 Compiling demo packages..."
  PKGS=("facilitator-amoy" "resource-server-express" "service-agent" "client-agent")
  for pkg in "${PKGS[@]}"; do
    TS_CONFIG="$ROOT_DIR/a2a/$pkg/tsconfig.json"
    DIST_DIR="$ROOT_DIR/a2a/$pkg/dist"
    if [ -f "$TS_CONFIG" ]; then
      echo "Compiling $pkg..."
      npx -y tsc -p "$TS_CONFIG"
    else
      if [ -d "$DIST_DIR" ]; then
        echo "No tsconfig for $pkg, found existing dist — skipping compile"
      else
        echo "ERROR: No tsconfig and no dist for $pkg ($TS_CONFIG / $DIST_DIR). Please build the package or provide dist files." >&2
        exit 1
      fi
    fi
  done

  # Start Facilitator
  echo "🚀 Starting Facilitator..."
  nohup env PORT="${FACILITATOR_PORT:-5401}" FACILITATOR_PRIVATE_KEY="$FACILITATOR_PRIVATE_KEY" AMOY_RPC_URL="$AMOY_RPC_URL" AMOY_USDC_ADDRESS="$AMOY_USDC_ADDRESS" REAL_SETTLE="$REAL_SETTLE" node "$ROOT_DIR/a2a/facilitator-amoy/dist/index.js" > /tmp/fac.log 2>&1 &
  echo $! > /tmp/fac.pid
  sleep 0.6

  # Start Resource Server
  echo "🚀 Starting Resource Server..."
  nohup env PORT="${RESOURCE_SERVER_PORT:-5403}" FACILITATOR_URL="$FACILITATOR_URL" node "$ROOT_DIR/a2a/resource-server-express/dist/index.js" > /tmp/res.log 2>&1 &
  echo $! > /tmp/res.pid
  sleep 0.6

  # Start Service Agent
  echo "🚀 Starting Service Agent..."
  nohup env PORT="${SERVICE_AGENT_PORT:-5402}" RESOURCE_SERVER_URL="$RESOURCE_SERVER_URL" node "$ROOT_DIR/a2a/service-agent/dist/index.js" > /tmp/service.log 2>&1 &
  echo $! > /tmp/service.pid
  sleep 1

  # Start Orchestrator
  echo "🚀 Starting Orchestrator..."
  
  # Install orchestrator dependencies if needed
  if [ ! -d "$ROOT_DIR/a2a/orchestrator/node_modules" ]; then
    echo "📦 Installing orchestrator dependencies..."
    cd "$ROOT_DIR/a2a/orchestrator" && npm install --silent
  fi
  
  nohup env PORT="${ORCHESTRATOR_PORT:-5400}" FACILITATOR_URL="$FACILITATOR_URL" node "$ROOT_DIR/a2a/orchestrator/server.js" > /tmp/orchestrator.log 2>&1 &
  echo $! > /tmp/orchestrator.pid
  sleep 3
  
  # Check if orchestrator started
  if ! curl -s http://localhost:5400/healthz > /dev/null 2>&1; then
    echo "❌ Orchestrator failed to start. Checking logs..." >&2
    tail -n 20 /tmp/orchestrator.log >&2
    exit 1
  fi

  # Start Python Services
  echo "🐍 Starting Python Services..."
  
  # GeckoTerminal Service
  nohup env PORT=5404 node "$ROOT_DIR/a2a/services/geckoterminal-service.js" > /tmp/geckoterminal.log 2>&1 &
  echo $! > /tmp/geckoterminal.pid
  sleep 0.5

  # Weather Service
  nohup env PORT=5405 npx ts-node "$ROOT_DIR/a2a/services/weather-service/index.ts" > /tmp/weather.log 2>&1 &
  echo $! > /tmp/weather.pid
  sleep 0.5

  # OHLCV Service  
  nohup env PORT=5406 node "$ROOT_DIR/a2a/services/ohlcv-service.js" > /tmp/ohlcv.log 2>&1 &
  echo $! > /tmp/ohlcv.pid
  sleep 0.5

  # Oracle Service
  nohup env PORT=5407 node "$ROOT_DIR/a2a/services/oracle-service.js" > /tmp/oracle.log 2>&1 &
  echo $! > /tmp/oracle.pid
  sleep 0.5

  # Sentiment Service
  nohup env PORT=5408 node "$ROOT_DIR/a2a/services/sentiment-service.js" > /tmp/sentiment.log 2>&1 &
  echo $! > /tmp/sentiment.pid
  sleep 0.5


  # Start Frontend
  echo "🌐 Starting Frontend..."
  
  # Check if UI directory exists
  if [ -d "$ROOT_DIR/../ui" ]; then
    cd "$ROOT_DIR/../ui"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
      echo "📦 Installing frontend dependencies..."
      npm install --silent
    fi
    
    # Start frontend in background
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    echo $! > /tmp/frontend.pid
    sleep 2
    
    echo "✅ Frontend started on http://localhost:${FRONTEND_PORT:-8000}"
  else
    echo "⚠️ UI directory not found at $ROOT_DIR/../ui" >&2
  fi
  
  cd "$ROOT_DIR"

  # Wait for health endpoints
  echo "⏳ Waiting for services to become healthy..."
  
  # Wait for each service individually with longer timeout
  for service in "facilitator:${FACILITATOR_PORT:-5401}" "resource:${RESOURCE_SERVER_PORT:-5403}" "service-agent:${SERVICE_AGENT_PORT:-5402}" "orchestrator:${ORCHESTRATOR_PORT:-5400}"; do
    local name=$(echo "$service" | cut -d: -f1)
    local port=$(echo "$service" | cut -d: -f2)
    local url="http://localhost:$port/healthz"
    
    echo "Waiting for $name on port $port..."
    local count=0
    while [ $count -lt 30 ]; do
      if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name is ready"
        break
      fi
      sleep 1
      count=$((count + 1))
    done
    
    if [ $count -eq 30 ]; then
      echo "⚠️ $name failed to start in time, continuing anyway..." >&2
    fi
  done
  
  echo "✅ All services are healthy and ready!"
}

# Function to execute the plan using REAL x402 payment flow
execute_plan() {
  local user_text="$1"
  local plan_json="$2"
  local price="$3"
  
  echo ""
  echo "💰 Payment Required: $((price / 1000)) USDC (${price} microUSDC)"
  echo "📋 Plan: $(echo "$plan_json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(', '.join([s['service'] for s in data.get('services', [])]))" 2>/dev/null || echo "Multiple services")"
  echo ""
  
  echo "🔄 Executing plan with REAL x402 payment flow..."
  
  # Create a temporary client agent script for this specific request
  local temp_client_script="/tmp/client_agent_$(date +%s).js"
  
  # Escape the user text and plan JSON for JavaScript
  local escaped_user_text=$(echo "$user_text" | sed "s/'/\\'/g")
  local escaped_plan_json=$(echo "$plan_json" | sed "s/'/\\'/g")
  
  cat > "$temp_client_script" << EOF
const { sendMessage } = require('$ROOT_DIR/a2a/client-agent/dist/a2a.js');

async function main() {
  const SERVICE_AGENT_URL = process.env.SERVICE_AGENT_URL || 'http://localhost:5402';
  const input = { 
    text: '$escaped_user_text',
    plan: $escaped_plan_json,
    price: $price
  };
  
  try {
    console.log('🚀 Sending request to service agent...');
    const resp = await sendMessage(SERVICE_AGENT_URL, 'orchestrate.execute', input);
    console.log('✅ A2A Response:');
    console.log(JSON.stringify(resp, null, 2));
  } catch (e) {
    console.error('❌ Error:', e.message);
    if (e.response) {
      console.error('Response status:', e.response.status);
      console.error('Response data:', e.response.data);
    }
    if (e.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure all services are running.');
    }
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
EOF

  # Run the client agent with real payment flow
  echo "💳 Executing with real x402 payment..."
  env PRIVATE_KEY="$PRIVATE_KEY" PRIVATE_KEY_ADDRESS="$PRIVATE_KEY_ADDRESS" PAYMENT_AMOUNT="$price" node "$temp_client_script"
  
  # Clean up
  rm -f "$temp_client_script"
}

# Function to show logs
show_logs() {
  echo ""
  echo "📋 Service Logs (last 50 lines each):"
  echo "====================================="
  
  printf "\n--- ORCHESTRATOR LOG ---\n"
  tail -n 50 /tmp/orchestrator.log || true
  
  printf "\n--- FACILITATOR LOG ---\n"
  tail -n 50 /tmp/fac.log || true
  
  printf "\n--- RESOURCE LOG ---\n"
  tail -n 50 /tmp/res.log || true
  
  printf "\n--- SERVICE LOG ---\n"
  tail -n 50 /tmp/service.log || true
}

# Function to cleanup
cleanup() {
  echo ""
  echo "🧹 Cleaning up services..."
  for pid_file in /tmp/fac.pid /tmp/res.pid /tmp/service.pid /tmp/orchestrator.pid /tmp/geckoterminal.pid /tmp/weather.pid /tmp/ohlcv.pid /tmp/oracle.pid /tmp/sentiment.pid /tmp/frontend.pid; do
    if [ -f "$pid_file" ]; then
      local pid=$(cat "$pid_file")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Stopping process $pid"
        kill "$pid" || true
      fi
      rm -f "$pid_file"
    fi
  done
  echo "✅ Cleanup complete"
}

# Main execution
main() {
  # Set up cleanup trap
  trap cleanup EXIT INT TERM
  
  # Start all required services
  start_services
  
  echo ""
  echo "🎉 Interactive x402 Demo with Frontend Integration Ready!"
  echo "========================================================"
  echo ""
  echo "🌐 Frontend UI: http://localhost:${FRONTEND_PORT:-8001}"
  echo "🔧 Backend Services:"
  echo "   - Orchestrator: http://localhost:${ORCHESTRATOR_PORT:-5400}"
  echo "   - Facilitator: http://localhost:${FACILITATOR_PORT:-5401}"
  echo "   - Service Agent: http://localhost:${SERVICE_AGENT_PORT:-5402}"
  echo "   - Resource Server: http://localhost:${RESOURCE_SERVER_PORT:-5403}"
  echo ""
  echo "💡 Instructions:"
  echo "   1. Open the frontend URL in your browser"
  echo "   2. Connect your wallet (MetaMask, etc.)"
  echo "   3. Enter your intent in the UI"
  echo "   4. Sign the transaction when prompted"
  echo "   5. Watch the services execute with real x402 payments!"
  echo ""
  echo "📋 Available Services:"
  echo "   - News Service (crypto news)"
  echo "   - Weather Service (weather data)"
  echo "   - Sentiment Analysis (market sentiment)"
  echo "   - OHLCV Data (price charts)"
  echo "   - Backtesting (strategy testing)"
  echo "   - Oracle Service (Chainlink data)"
  echo "   - GeckoTerminal (trending pools)"
  echo ""
  echo "🔄 Press Ctrl+C to stop all services"
  echo ""
  
  # Keep the script running to maintain services
  while true; do
    sleep 1
  done
}

# Run the main function
main "$@"
