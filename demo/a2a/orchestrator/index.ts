import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors({ exposedHeaders: ['X-PAYMENT-RESPONSE'] }));
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5400;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:5401';

// Service endpoints - using existing examples
const SERVICE_ENDPOINTS: { [key: string]: string } = {
  'news': 'http://localhost:5404/news',
  'weather': 'http://localhost:5405/weather',
  'ohlcv': 'http://localhost:5406/ohlcv',
  'nft': 'http://localhost:5407/nft',
  'backtest': 'http://localhost:5408/backtest'
};

// Simple plan generation (without Python for now)
function generatePlan(userText: string): any {
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

function calculatePrice(services: any[]): number {
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
app.post('/process', async (req: any, res: any) => {
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
        payTo: '0xPayToAddress',
        maxAmountRequired: price.toString(),
        maxTimeoutSeconds: 120,
        asset: '0xAmoyUSDC',
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
 * Execute services after payment verification (simplified for demo)
 */
app.post('/execute', async (req: any, res: any) => {
  const { plan } = req.body;
  if (!plan || !plan.services) {
    return res.status(400).json({ error: 'Plan with services required' });
  }

  console.log('Executing services:', plan.services);

  // Execute each service (simplified - no actual payment verification for demo)
  const results = [];
  for (const service of plan.services) {
    try {
      const serviceName = service.service.toLowerCase();

      // For demo, just return mock data
      let mockResult = {};
      if (serviceName === 'news') {
        mockResult = {
          service: 'news',
          description: service.description,
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
          timestamp: new Date().toISOString()
        };
      } else if (serviceName === 'weather') {
        mockResult = {
          service: 'weather',
          description: service.description,
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
          timestamp: new Date().toISOString()
        };
      } else if (serviceName === 'ohlcv') {
        mockResult = {
          service: 'ohlcv',
          description: service.description,
          data: [
            { symbol: 'BTC', open: 45000, high: 46000, low: 44000, close: 45500, volume: 1000000 },
            { symbol: 'ETH', open: 3000, high: 3100, low: 2950, close: 3050, volume: 500000 }
          ],
          timestamp: new Date().toISOString()
        };
      } else if (serviceName === 'nft') {
        mockResult = {
          service: 'nft',
          description: service.description,
          rarity: 85,
          traits: [
            { name: 'Background', value: 'Rare', rarity: 15 },
            { name: 'Eyes', value: 'Laser', rarity: 5 },
            { name: 'Hat', value: 'Crown', rarity: 2 }
          ],
          timestamp: new Date().toISOString()
        };
      } else if (serviceName === 'backtest') {
        mockResult = {
          service: 'backtest',
          description: service.description,
          results: {
            totalReturn: 15.5,
            sharpeRatio: 1.8,
            maxDrawdown: -5.2,
            winRate: 65.5,
            trades: 120
          },
          timestamp: new Date().toISOString()
        };
      }

      results.push({
        service: serviceName,
        status: 'success',
        result: mockResult,
        description: service.description
      });

    } catch (serviceError: any) {
      results.push({
        service: service.service,
        status: 'error',
        error: serviceError?.message || 'Unknown error',
        description: service.description
      });
    }
  }

  res.json({
    success: true,
    results,
    plan,
    executedAt: new Date().toISOString()
  });
});

app.get('/healthz', (_req: any, res: any) => res.json({
  ok: true,
  facilitator: FACILITATOR_URL,
  services: Object.keys(SERVICE_ENDPOINTS)
}));

app.listen(PORT, () => {
  console.log(`Orchestrator listening on port ${PORT}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`Available services: ${Object.keys(SERVICE_ENDPOINTS).join(', ')}`);
});