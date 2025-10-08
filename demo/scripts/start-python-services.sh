#!/bin/bash
set -euo pipefail
# This is the corrected line
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🐍 Starting Python Services with x402 Integration"
echo "=================================================="

# Load environment
if [ -f "$ROOT_DIR/.env.local" ]; then
  set -a
  . "$ROOT_DIR/.env.local"
  set +a
  echo "✅ Environment loaded from .env.local"
else
  echo "⚠️  No .env.local found, using defaults"
fi

# Set default environment variables
export PYTHON_SERVER_PORT=${PYTHON_SERVER_PORT:-5411}
export FACILITATOR_URL=${FACILITATOR_URL:-http://localhost:5401}
export PAY_TO_ADDRESS=${PAY_TO_ADDRESS:-0xPayToAddress}
export USDC_CONTRACT=${USDC_CONTRACT:-0xAmoyUSDC}

# Check Python dependencies
echo "🔍 Checking Python dependencies..."
cd "$ROOT_DIR/demo/a2a/services"

if [ ! -d "venv" ]; then
  echo "📦 Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install -q flask flask-cors requests pandas vaderSentiment

# Check if Python server file exists
if [ ! -f "python_server.py" ]; then
  echo "❌ python_server.py not found!"
  echo "Please ensure the Python server file is created."
  exit 1
fi

# Start Python server
echo "🚀 Starting Python Services Server on port $PYTHON_SERVER_PORT..."
echo "📡 Facilitator URL: $FACILITATOR_URL"
echo "💰 Pay to address: $PAY_TO_ADDRESS"
echo "🪙 USDC contract: $USDC_CONTRACT"
echo ""

# Run Python server
python python_server.py
