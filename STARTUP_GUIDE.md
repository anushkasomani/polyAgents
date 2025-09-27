# 🚀 AI Agent Marketplace - Complete Startup Guide

## 📋 **Prerequisites**

Make sure you have the following installed:
- ✅ Node.js and npm
- ✅ Python 3
- ✅ Git (for cloning the repository)

---

## 🎯 **Quick Start (2 Commands)**

### **1. Start Backend (Orchestrator)**
```bash
cd /home/hiha/tinkering/evening/x402/demo
python3 mock-orchestrator.py
```
**Expected Output:**
```
🚀 Mock Orchestrator running on http://localhost:5400
Available endpoints:
  GET  /health - Health check
  POST /process - Process user intent
  POST /execute - Execute services
🧪 Ready to test intent processing!
```

### **2. Start Frontend (React App)**
```bash
cd /home/hiha/tinkering/evening/x402/ui
npm run dev
```
**Expected Output:**
```
VITE v5.4.19  ready in 437 ms
➜  Local:   http://localhost:8080/
➜  Network: http://10.96.0.114:8080/
```

---

## 🌐 **Access the Platform**

### **Frontend URL**: http://localhost:8080
### **Backend API**: http://localhost:5400

---

## 🎮 **How to Use the Platform**

### **Step 1: Open the Frontend**
1. Open your browser
2. Navigate to `http://localhost:8080`
3. You'll see the AI Agent Marketplace dashboard

### **Step 2: Start a New Intent**
1. Click the **"Start New Intent"** button
2. This opens the Intent Processor modal

### **Step 3: Enter Your Intent**
Type a natural language request, such as:
- `"Get BTC news and sentiment analysis"`
- `"Get weather for London and ETH price data"`
- `"I want BTC news, weather in Tokyo, sentiment analysis, and run a backtest"`

### **Step 4: Watch the Processing**
The system will:
1. **Parse Intent**: Analyze your request
2. **Payment Required**: Show x402 payment requirements
3. **Process Payment**: Simulate USDC payment
4. **Execute Services**: Run the identified microservices
5. **Aggregate Results**: Combine all service data

### **Step 5: View Results**
You'll see:
- ✅ Services that were executed
- 📊 Data from each service
- 💰 Total cost paid
- 📈 Combined analysis

---

## 🔧 **Available Services**

| Service | Price | Description | Example Intent |
|---------|-------|-------------|----------------|
| **News** | $0.10 | Crypto headlines + sentiment | "Get BTC news" |
| **Weather** | $0.05 | Location, temperature, conditions | "Get weather for London" |
| **Sentiment** | $0.15 | Market sentiment analysis | "Analyze BTC sentiment" |
| **OHLCV** | $0.20 | Price data + volume | "Get ETH price data" |
| **Backtest** | $0.50 | Strategy performance metrics | "Run a backtest" |
| **Oracle** | $0.25 | Chainlink price feeds | "Get oracle data" |
| **GeckoTerminal** | $0.30 | DeFi analytics + pools | "Get DeFi trends" |

---

## 🧪 **Testing the Platform**

### **Test 1: Simple Intent**
```
Intent: "Get BTC news and sentiment analysis"
Expected: 2 services, $0.25 cost
```

### **Test 2: Multi-Service Intent**
```
Intent: "Get weather for London and ETH price data"
Expected: 3 services, $0.35 cost
```

### **Test 3: Complex Intent**
```
Intent: "I want BTC news, weather in Tokyo, sentiment analysis, and run a backtest"
Expected: 4 services, $0.80 cost
```

---

## 🛠️ **Troubleshooting**

### **Backend Not Starting**
```bash
# Check if port 5400 is available
netstat -tlnp | grep :5400

# Kill any existing process
pkill -f mock-orchestrator.py

# Restart
python3 mock-orchestrator.py
```

### **Frontend Not Starting**
```bash
# Check if port 8080 is available
netstat -tlnp | grep :8080

# Kill any existing process
pkill -f "npm run dev"

# Restart
cd /home/hiha/tinkering/evening/x402/ui
npm run dev
```

### **Integration Issues**
```bash
# Test backend connectivity
curl http://localhost:5400/health

# Test frontend connectivity
curl -I http://localhost:8080

# Run integration test
cd /home/hiha/tinkering/evening/x402
node test-integration.js
```

---

## 📊 **System Status Check**

### **Backend Health Check**
```bash
curl http://localhost:5400/health
```
**Expected**: `{"status": "healthy", "timestamp": "..."}`

### **Frontend Health Check**
```bash
curl -I http://localhost:8080
```
**Expected**: `HTTP/1.1 200 OK`

### **Integration Test**
```bash
cd /home/hiha/tinkering/evening/x402
node test-integration.js
```
**Expected**: All tests pass ✅

---

## 🎯 **Example User Journey**

1. **Open Browser** → Navigate to http://localhost:8080
2. **Click "Start New Intent"** → Intent Processor opens
3. **Type Intent** → "Get BTC news and sentiment analysis"
4. **Click "Process Intent"** → System processes request
5. **Watch Progress** → Real-time processing steps
6. **View Results** → See news headlines and sentiment data
7. **Explore Services** → Click "Browse Services" to see all available services

---

## 🚀 **Advanced Usage**

### **Browse Available Services**
1. Click **"Browse Services"** on the dashboard
2. See all 7 microservices with pricing
3. Click on any service to learn more

### **Run Integration Tests**
1. Click **"Run Tests"** on the dashboard
2. See comprehensive test suite
3. Verify all systems working

### **Multiple Intents**
- Try different combinations of services
- Test complex multi-service requests
- Experiment with natural language variations

---

## 🎉 **Success Indicators**

### **✅ System is Working When:**
- Backend shows: `🚀 Mock Orchestrator running on http://localhost:5400`
- Frontend shows: `VITE v5.4.19 ready in 437 ms`
- Browser loads: http://localhost:8080
- Intent processing works without errors
- Services execute and return data

### **❌ System Issues When:**
- Backend shows connection errors
- Frontend shows build errors
- Browser shows "This site can't be reached"
- Intent processing fails with errors
- Services return empty or error responses

---

## 🎊 **You're Ready!**

Once both services are running:
- **Frontend**: http://localhost:8080 ✅
- **Backend**: http://localhost:5400 ✅

**Start using the AI Agent Marketplace!** 🚀

Try these example intents:
- "Get BTC news and sentiment analysis"
- "Get weather for London and ETH price data"
- "I want BTC news, weather in Tokyo, sentiment analysis, and run a backtest"
