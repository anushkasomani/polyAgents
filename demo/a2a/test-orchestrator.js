const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5400;

// Simple plan generation
function generatePlan(userText) {
  const text = userText.toLowerCase();
  const services = [];

  // Simple keyword matching
  if (text.includes('news') || text.includes('btc') || text.includes('eth') || text.includes('crypto')) {
    services.push({
      service: 'news',
      description: 'Get cryptocurrency news',
      price: 0.10
    });
  }

  if (text.includes('weather') || text.includes('london') || text.includes('new york') || text.includes('tokyo')) {
    services.push({
      service: 'weather',
      description: 'Get weather information',
      price: 0.05
    });
  }

  if (text.includes('sentiment') || text.includes('mood') || text.includes('analysis')) {
    services.push({
      service: 'sentiment',
      description: 'Get market sentiment analysis',
      price: 0.15
    });
  }

  if (text.includes('price') || text.includes('ohlcv') || text.includes('chart')) {
    services.push({
      service: 'ohlcv',
      description: 'Get OHLCV price data',
      price: 0.20
    });
  }

  return { services };
}

function calculatePrice(services) {
  return services.reduce((total, service) => total + service.price, 0);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Process user text and return payment requirements
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

    // Step 3: Return 402 with payment requirements
    return res.status(402).json({
      accepts: [{
        scheme: 'exact',
        network: 'polygon-amoy',
        resource: `http://localhost:${PORT}/process`,
        description: 'Service execution',
        mimeType: 'application/json',
        payTo: '0x19221F5916660EDfDD2d64675fFE2f20fA6f767E',
        maxAmountRequired: (price * 1000000).toString(), // Convert to wei
        maxTimeoutSeconds: 120,
        asset: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
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

// Execute services after payment verification
app.post('/execute', async (req, res) => {
  try {
    const { plan } = req.body;
    const paymentHeader = req.headers['x-payment'];

    console.log('Executing plan:', plan);
    console.log('Payment header:', paymentHeader ? 'Present' : 'Missing');

    // Simulate service execution
    const results = [];
    for (const service of plan.services) {
      const result = {
        service: service.service,
        description: service.description,
        data: {
          message: `Mock data from ${service.service} service`,
          timestamp: new Date().toISOString(),
          price: service.price
        },
        success: true
      };
      results.push(result);
    }

    res.json({
      success: true,
      results,
      totalCost: calculatePrice(plan.services),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing services:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test Orchestrator running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  POST /process - Process user intent');
  console.log('  POST /execute - Execute services');
});
