# AI Agent Marketplace - Complete User Workflow

A comprehensive platform that connects users with specialized AI microservices through an intelligent orchestration system and x402 payment protocol.

## 🚀 Features

### **Complete User Workflow**
1. **Landing Page** - Browse available microservices
2. **Intent Processing** - Natural language intent parsing
3. **Service Orchestration** - Automated microservice coordination
4. **Payment Integration** - x402 protocol with stablecoin payments
5. **Results Aggregation** - Combined data presentation

### **Available Microservices**
- 📰 **News Service** - Cryptocurrency news with sentiment analysis ($0.10)
- 🌤️ **Weather Service** - Global weather data ($0.05)
- 🧠 **Sentiment Analysis** - Market sentiment and social media trends ($0.15)
- 📈 **OHLCV Data** - Historical and real-time price data ($0.20)
- 🔄 **Backtesting** - Trading strategy backtesting ($0.50)
- 🔗 **Oracle Service** - Chainlink price feeds ($0.25)
- 🦎 **GeckoTerminal** - DeFi analytics and trending pools ($0.30)

## 🏗️ Architecture

### **Frontend (ui/)**
- **Dashboard** - Main landing page with service showcase
- **IntentProcessor** - Smart intent parsing and orchestration
- **MicroservicesShowcase** - Service catalog with pricing
- **Payment Integration** - x402 protocol implementation

### **Backend (demo/a2a/)**
- **Orchestrator** - Service coordination and payment handling
- **Service Agent** - A2A protocol implementation
- **Microservices** - Individual service endpoints
- **Facilitator** - Payment verification and settlement

## 🔄 User Journey

### **Step 1: Landing Page**
```
User visits platform → Sees all available microservices
→ Clicks "Start New Intent" → Opens intent processor
```

### **Step 2: Intent Processing**
```
User describes need: "Get BTC sentiment and latest news"
→ Platform agent parses intent
→ Identifies required services: [news, sentiment]
→ Calculates total cost: $0.25
```

### **Step 3: Payment & Execution**
```
User confirms payment → x402 protocol handles USDC payment
→ Services execute in parallel
→ Results aggregated and displayed
```

## 💰 Payment Flow (x402 Protocol)

### **Phase 1: Discovery**
1. User makes request without payment
2. Server responds with 402 Payment Required
3. Payment requirements returned with pricing

### **Phase 2: Payment**
1. Client creates payment payload
2. X-PAYMENT header sent with request
3. Server verifies payment via facilitator
4. Services execute after verification
5. Payment settled on blockchain

## 🛠️ Technical Implementation

### **Intent Parsing**
```typescript
const parseIntent = (intent: string): string[] => {
  const services: string[] = [];
  const lowerIntent = intent.toLowerCase();

  if (lowerIntent.includes('news') || lowerIntent.includes('btc')) {
    services.push('news');
  }
  if (lowerIntent.includes('sentiment') || lowerIntent.includes('analysis')) {
    services.push('sentiment');
  }
  // ... more service mappings

  return services;
};
```

### **Service Orchestration**
```typescript
const executeService = async (service: string, description: string) => {
  const response = await fetch(serviceConfig.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PAYMENT': paymentHeader // x402 payment
    },
    body: JSON.stringify({ service, description })
  });
  
  return response.json();
};
```

### **Cost Calculation**
```typescript
const calculateTotalCost = (services: string[]): number => {
  return services.reduce((total, service) => {
    return total + SERVICE_MAPPING[service]?.price || 0;
  }, 0);
};
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm/yarn
- Access to microservices (demo/a2a/services)

### **Installation**
```bash
cd ui/
npm install
npm run dev
```

### **Backend Services**
```bash
cd demo/a2a/
./scripts/start-all.sh
```

## 📊 Service Endpoints

| Service | Endpoint | Price | Description |
|---------|----------|-------|-------------|
| News | `http://localhost:5404/news` | $0.10 | Crypto news + sentiment |
| Weather | `http://localhost:5405/weather` | $0.05 | Global weather data |
| Sentiment | `http://localhost:5408/sentiment` | $0.15 | Market sentiment analysis |
| OHLCV | `http://localhost:5406/ohlcv` | $0.20 | Price data |
| Backtest | `http://localhost:5409/backtest` | $0.50 | Strategy testing |
| Oracle | `http://localhost:5407/oracle` | $0.25 | Chainlink feeds |
| GeckoTerminal | `http://localhost:5404/geckoterminal` | $0.30 | DeFi analytics |

## 🔧 Configuration

### **Environment Variables**
```bash
# Orchestrator
PORT=5400
FACILITATOR_URL=http://localhost:5401
FACILITATOR_ADDRESS=0x19221F5916660EDfDD2d64675fFE2f20fA6f767E
AMOY_USDC_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Services
NEWS_SERVICE_URL=http://localhost:5404/news
WEATHER_SERVICE_URL=http://localhost:5405/weather
SENTIMENT_SERVICE_URL=http://localhost:5408/sentiment
```

## 🎯 Example Intents

### **Simple Intent**
```
"Get BTC news"
→ Services: [news]
→ Cost: $0.10
```

### **Complex Intent**
```
"Get BTC sentiment analysis and latest news, then run a backtest"
→ Services: [news, sentiment, backtest]
→ Cost: $0.75
```

### **Multi-Service Intent**
```
"Analyze ETH price trends, get weather for London, and check DeFi pools"
→ Services: [ohlcv, weather, geckoterminal]
→ Cost: $0.55
```

## 🔒 Security

- **Payment Verification** - All payments verified via x402 protocol
- **Service Isolation** - Each microservice runs independently
- **Rate Limiting** - Built-in protection against abuse
- **Error Handling** - Comprehensive error management

## 📈 Performance

- **Parallel Execution** - Services run concurrently
- **Caching** - Results cached for repeated requests
- **Load Balancing** - Multiple service instances
- **Real-time Updates** - Live progress tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your microservice to the catalog
4. Implement x402 payment integration
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using React, TypeScript, and x402 Protocol**