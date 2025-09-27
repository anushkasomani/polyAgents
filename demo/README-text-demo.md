# Text-to-Services x402 Demo

This demo implements a complete x402 payment protocol flow where users can request services using natural language text.

## Architecture

1. **User Input**: User provides free text describing what they want
2. **Intent Analysis**: Gemini AI analyzes the text and extracts service requirements
3. **Price Calculation**: System calculates price based on number and complexity of services
4. **Payment Flow**: x402 protocol handles payment requirements and verification
5. **Service Execution**: Requested services are executed and results returned

## Services Available

- **News Service**: Get cryptocurrency news (BTC, ETH, DOGE)
- **Weather Service**: Get weather information for various cities
- **OHLCV Service**: Get price data (placeholder)
- **NFT Service**: Get NFT information (placeholder)
- **Backtest Service**: Run trading backtests (placeholder)

## Setup

1. **Install Dependencies**:
   ```bash
   # Install orchestrator dependencies
   cd demo/a2a/orchestrator
   npm install
   
   # Install service dependencies
   cd ../services/news-service
   npm install
   
   cd ../weather-service
   npm install
   
   # Install frontend dependencies
   cd ../../frontend
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   export GOOGLE_API_KEY="your-google-api-key"
   export FACILITATOR_URL="http://localhost:5401"
   export ADDRESS="0xPayToAddress"
   export AMOY_USDC_ADDRESS="0xAmoyUSDC"
   ```

3. **Start the Demo**:
   ```bash
   # Make sure facilitator is running on port 5401
   # Then start the text demo
   ./scripts/start-text-demo.sh
   ```

## Usage

1. Open http://localhost:3000
2. Enter your request in natural language, e.g.:
   - "Get me the latest news on BTC and ETH"
   - "What's the weather like in London tomorrow?"
   - "I want news about DOGE and weather in New York"
3. The system will:
   - Analyze your text using AI
   - Calculate the price
   - Request payment (simulated in demo)
   - Execute the services
   - Return the results

## Example Queries

- "Get me the latest news on BTC and ETH and also get me the latest news on DOGE from reddit or x and tell me about this NFT or give me a rarity score on this NFT. Get me the weather prediction for tomorrow in London. And run backtest on Solana/Arbitrum if the sentiment is good."

## API Endpoints

- `POST /process` - Process user text and return payment requirements
- `POST /execute` - Execute services after payment verification
- `GET /healthz` - Health check

## Services

- News Service: `http://localhost:5404/news`
- Weather Service: `http://localhost:5405/weather`
- Orchestrator: `http://localhost:5400`
- Frontend: `http://localhost:3000`
