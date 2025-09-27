const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({ exposedHeaders: ['X-PAYMENT-RESPONSE'] }));
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5400;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:5401';

// Service endpoints - using existing examples
const SERVICE_ENDPOINTS = {
  'news': 'http://localhost:5404/news',
  'weather': 'http://localhost:5405/weather',
  'ohlcv': 'http://localhost:5406/ohlcv',
  'nft': 'http://localhost:5407/nft',
  'backtest': 'http://localhost:5408/backtest'
};

// Simple plan generation (without Python for now)
function generatePlan(userText) {
  const text = userText.toLowerCase();
  const services = [];

  // Simple keyword matching
  if (text.includes('news') || text.includes('btc') || text.includes('eth') || text.includes('doge') || text.includes('crypto')) {
    services.push({
      service: 'news',
      description: 'Get cryptocurrency news'
    });
  }

  if (text.includes('weather') || text.includes('london') || text.includes('new york') || text.includes('tokyo')) {
    services.push({
      service: 'weather',
      description: 'Get weather information'
    });
  }

  if (text.includes('price') || text.includes('ohlcv') || text.includes('chart')) {
    services.push({
      service: 'ohlcv',
      description: 'Get price data'
    });
  }

  if (text.includes('nft') || text.includes('rarity')) {
    services.push({
      service: 'nft',
      description: 'Get NFT information'
    });
  }

  if (text.includes('backtest') || text.includes('trading') || text.includes('strategy')) {
    services.push({
      service: 'backtest',
      description: 'Run trading backtest'
    });
  }

  return { services };
}

// Helper function to generate mock service results
function getMockServiceResult(serviceName, description) {
  const timestamp = new Date().toISOString();

  switch (serviceName) {
    case 'news':
      return {
        service: 'news',
        description: description,
        results: [
          {
            symbol: 'BTC',
            news: [
              { title: 'Bitcoin reaches new all-time high', source: 'CoinDesk', time: '2 hours ago', sentiment: 'positive' },
              { title: 'Major institution adopts Bitcoin', source: 'Reuters', time: '4 hours ago', sentiment: 'positive' }
            ]
          },
          {
            symbol: 'ETH',
            news: [
              { title: 'Ethereum network upgrade successful', source: 'Ethereum Foundation', time: '1 hour ago', sentiment: 'positive' },
              { title: 'Gas fees drop significantly', source: 'DeFi Pulse', time: '3 hours ago', sentiment: 'positive' }
            ]
          }
        ],
        timestamp: timestamp
      };
    case 'weather':
      return {
        service: 'weather',
        description: description,
        city: 'London',
        current: {
          temperature: 15,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12
        },
        forecast: [
          { day: 'Today', high: 18, low: 12, condition: 'Partly Cloudy' },
          { day: 'Tomorrow', high: 20, low: 14, condition: 'Sunny' },
          { day: 'Day After', high: 17, low: 11, condition: 'Rainy' }
        ],
        timestamp: timestamp
      };
    case 'ohlcv':
      return {
        service: 'ohlcv',
        description: description,
        data: [
          { symbol: 'BTC', open: 45000, high: 46000, low: 44000, close: 45500, volume: 1000000 },
          { symbol: 'ETH', open: 3000, high: 3100, low: 2950, close: 3050, volume: 500000 }
        ],
        timestamp: timestamp
      };
    case 'nft':
      return {
        service: 'nft',
        description: description,
        rarity: 85,
        traits: [
          { name: 'Background', value: 'Rare', rarity: 15 },
          { name: 'Eyes', value: 'Laser', rarity: 5 },
          { name: 'Hat', value: 'Crown', rarity: 2 }
        ],
        timestamp: timestamp
      };
    case 'backtest':
      return {
        service: 'backtest',
        description: description,
        results: {
          totalReturn: 15.5,
          sharpeRatio: 1.8,
          maxDrawdown: -5.2,
          winRate: 65.5,
          trades: 120
        },
        timestamp: timestamp
      };
    default:
      return {
        service: serviceName,
        description: description,
        message: 'Service executed successfully',
        timestamp: timestamp
      };
  }
}

function calculatePrice(services) {
  const basePrice = 1000; // 0.001 USDC (6 decimals)

  if (services.length === 1) {
    return basePrice;
  } else if (services.length === 2) {
    return Math.floor(basePrice * 1.8); // 10% discount for 2 operations
  } else if (services.length === 3) {
    return Math.floor(basePrice * 2.5); // 17% discount for 3 operations
  } else {
    return Math.floor(services.length * basePrice * 0.9); // 10% discount for 4+
  }
}

/**
 * Main endpoint: Process user text input and return payment requirements
 */
app.post('/process', async (req, res) => {
  try {
    const { userText } = req.body;

    if (!userText) {
      return res.status(400).json({ error: 'userText is required' });
    }

    console.log('Processing user text:', userText);

    // Step 1: Generate plan
    const plan = generatePlan(userText);
    console.log('Generated plan:', plan);

    if (!plan.services || plan.services.length === 0) {
      return res.status(400).json({ error: 'No services identified in user text' });
    }

    // Step 2: Calculate price
    const price = calculatePrice(plan.services);
    console.log('Calculated price:', price);

    // Step 3: Return 402 with payment requirements (simplified for demo)
    return res.status(402).json({
      accepts: [{
        scheme: 'exact',
        network: 'polygon-amoy',
        resource: `http://localhost:${PORT}/process`,
        description: 'Service execution',
        mimeType: 'application/json',
        payTo: process.env.FACILITATOR_ADDRESS || '0x19221F5916660EDfDD2d64675fFE2f20fA6f767E',
        maxAmountRequired: price.toString(),
        maxTimeoutSeconds: 120,
        asset: process.env.AMOY_USDC_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
        extra: { name: 'USDC', version: '2' }
      }],
      plan,
      price,
      message: 'Payment required to execute services'
    });

  } catch (error) {
    console.error('Error processing user text:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Execute services after payment verification with real x402 flow
 */
app.post('/execute', async (req, res) => {
  const paymentHeader = req.headers['x-payment'];
  const { plan } = req.body;

  if (!paymentHeader) {
    return res.status(402).json({ error: 'X-Payment header required' });
  }

  if (!plan || !plan.services) {
    return res.status(400).json({ error: 'Plan with services required' });
  }

  console.log('🔍 FACILITATOR: Verifying payment...');
  console.log('Payment header:', paymentHeader);

  // Step 1: Verify payment with facilitator
  try {
    console.log('🔍 FACILITATOR: Sending verification request...');
    const verifyResponse = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayloadBase64: paymentHeader })
    });

    const verifyResult = await verifyResponse.json();
    console.log('🔍 FACILITATOR VERIFY RESPONSE:', JSON.stringify(verifyResult, null, 2));

    if (!verifyResult.success) {
      console.log('❌ FACILITATOR: Payment verification failed!');
      return res.status(402).json({
        error: 'Payment verification failed',
        details: verifyResult
      });
    }

    console.log('✅ FACILITATOR: Payment verified successfully!');
  } catch (error) {
    console.error('❌ FACILITATOR: Payment verification error:', error);
    return res.status(502).json({
      error: 'Facilitator unreachable',
      details: String(error)
    });
  }

  console.log('🚀 Executing services:', plan.services);

  // Step 2: Execute services as a bundle
  console.log('🔄 BUNDLING: Executing all services in single transaction...');
  const results = [];

  // Execute all services in parallel for better performance
  const servicePromises = plan.services.map(async (service) => {
    try {
      const serviceName = service.service.toLowerCase();
      const serviceUrl = SERVICE_ENDPOINTS[serviceName];

      if (serviceUrl) {
        // Call actual service endpoint
        console.log(`📞 Calling ${serviceName} service at ${serviceUrl}`);
        const serviceResponse = await fetch(serviceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: serviceName,
            description: service.description,
            timestamp: new Date().toISOString()
          })
        });

        if (serviceResponse.ok) {
          const serviceResult = await serviceResponse.json();
          return {
            service: serviceName,
            status: 'success',
            result: serviceResult,
            description: service.description
          };
        } else {
          throw new Error(`Service ${serviceName} returned ${serviceResponse.status}`);
        }
      } else {
        // Fallback to mock data for services without endpoints
        console.log(`⚠️ No endpoint for ${serviceName}, using mock data`);
        return {
          service: serviceName,
          status: 'success',
          result: getMockServiceResult(serviceName, service.description),
          description: service.description
        };
      }
    } catch (serviceError) {
      console.error(`❌ Service ${service.service} failed:`, serviceError.message);
      return {
        service: service.service,
        status: 'error',
        error: serviceError?.message || 'Unknown error',
        description: service.description
      };
    }
  });

  // Wait for all services to complete
  const serviceResults = await Promise.all(servicePromises);
  results.push(...serviceResults);

  // Step 3: Settle payment with facilitator
  console.log('💰 FACILITATOR: Settling payment...');
  let settlementResult = null;

  try {
    console.log('💰 FACILITATOR: Sending settlement request...');
    const settleResponse = await fetch(`${FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayloadBase64: paymentHeader })
    });

    settlementResult = await settleResponse.json();
    console.log('💰 FACILITATOR SETTLE RESPONSE:', JSON.stringify(settlementResult, null, 2));
    console.log('💰 FACILITATOR SETTLE STATUS:', settleResponse.status);

    // Extract transaction hash from response
    const transactionHash = settlementResult.transaction;
    console.log('💰 EXTRACTED TRANSACTION HASH:', transactionHash);
    if (transactionHash) {
      console.log('🎉 FACILITATOR: Transaction Hash:', transactionHash);
      console.log('🔗 BLOCKCHAIN: Transaction submitted to Polygon Amoy!');
    } else {
      console.log('⚠️ FACILITATOR: No transaction hash (simulation mode)');
      console.log('⚠️ FACILITATOR: Settlement result keys:', Object.keys(settlementResult));
    }

  } catch (error) {
    console.error('❌ FACILITATOR: Settlement error:', error);
    settlementResult = { success: false, error: String(error) };
  }

  // Step 4: Return bundled results with transaction info
  console.log(`✅ BUNDLED EXECUTION: Completed ${results.length} services in single transaction`);
  res.json({
    success: true,
    bundled: true,
    serviceCount: results.length,
    results,
    plan,
    executedAt: new Date().toISOString(),
    payment: {
      verified: true,
      settled: settlementResult?.success || false,
      transactionHash: settlementResult?.transaction || null,
      network: 'polygon-amoy',
      facilitator: FACILITATOR_URL,
      bundledServices: plan.services.map(s => s.service)
    }
  });
});

app.get('/healthz', (req, res) => res.json({
  ok: true,
  facilitator: FACILITATOR_URL,
  services: Object.keys(SERVICE_ENDPOINTS)
}));

app.listen(PORT, () => {
  console.log(`Orchestrator listening on port ${PORT}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`Available services: ${Object.keys(SERVICE_ENDPOINTS).join(', ')}`);
});
