#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Load env
if [ -f "$ROOT_DIR/.env.local" ]; then
  set -a
  . "$ROOT_DIR/.env.local"
  set +a
fi

echo "🚀 Starting services..."

# Start Orchestrator
echo "🚀 Starting Orchestrator..."
nohup env PORT=5400 FACILITATOR_URL=http://localhost:5401 node "$ROOT_DIR/a2a/orchestrator/server.js" > /tmp/orchestrator.log 2>&1 &
echo $! > /tmp/orchestrator.pid
sleep 3

# Check if orchestrator started
if curl -s http://localhost:5400/healthz > /dev/null 2>&1; then
  echo "✅ Orchestrator is ready"
else
  echo "❌ Orchestrator failed to start"
  tail -n 10 /tmp/orchestrator.log
  exit 1
fi

echo "✅ Test complete"
