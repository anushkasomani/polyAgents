import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { buildPaymentRequirements, verifyPayment, settlePayment } from '../../orchestrator/x402.js';

const app = express();
app.use(cors({ exposedHeaders: ['X-PAYMENT-RESPONSE'] }));
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5405;
const ADDRESS = process.env.ADDRESS || '0xPayToAddress';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:5401';
const AMOY_USDC_ADDRESS = process.env.AMOY_USDC_ADDRESS || '0xAmoyUSDC';

// Mock weather data
const mockWeatherData = {
  'London': {
    temperature: 15,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Today', high: 18, low: 12, condition: 'Partly Cloudy' },
      { day: 'Tomorrow', high: 20, low: 14, condition: 'Sunny' },
      { day: 'Day After', high: 17, low: 11, condition: 'Rainy' }
    ]
  },
  'New York': {
    temperature: 22,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    forecast: [
      { day: 'Today', high: 25, low: 18, condition: 'Sunny' },
      { day: 'Tomorrow', high: 23, low: 16, condition: 'Cloudy' },
      { day: 'Day After', high: 20, low: 14, condition: 'Rainy' }
    ]
  },
  'Tokyo': {
    temperature: 28,
    condition: 'Hot and Humid',
    humidity: 80,
    windSpeed: 5,
    forecast: [
      { day: 'Today', high: 30, low: 25, condition: 'Hot and Humid' },
      { day: 'Tomorrow', high: 32, low: 26, condition: 'Very Hot' },
      { day: 'Day After', high: 29, low: 24, condition: 'Thunderstorms' }
    ]
  }
};

app.post('/weather', async (req: any, res: any) => {
  const paymentHeader = req.headers['x-payment'] as string | undefined;

  if (!paymentHeader) {
    const resourceUrl = `http://localhost:${PORT}/weather`;
    const accepts = [buildPaymentRequirements(resourceUrl, ADDRESS, AMOY_USDC_ADDRESS)];
    return res.status(402).json({ accepts });
  }

  try {
    // Verify payment
    const verify = await verifyPayment(paymentHeader);
    if (!verify || !verify.success) {
      return res.status(402).json({ error: 'payment_verification_failed', details: verify });
    }

    const { description, service } = req.body;
    console.log(`Weather service executing: ${description}`);

    // Extract city from description
    const cities = ['London', 'New York', 'Tokyo', 'Paris', 'Berlin', 'Sydney'];
    const mentionedCity = cities.find(city =>
      description.toLowerCase().includes(city.toLowerCase())
    );

    const targetCity = mentionedCity || 'London'; // Default to London if no city mentioned
    const weatherData = mockWeatherData[targetCity] || mockWeatherData['London'];

    // Settle payment
    try {
      const settle = await settlePayment(paymentHeader);
      const resp = settle.data || {};
      const responsePayload = {
        success: !!resp.success,
        transaction: resp.transaction || null,
        network: 'polygon-amoy',
        payer: resp.payer || null
      };
      const b64 = Buffer.from(JSON.stringify(responsePayload)).toString('base64');
      res.setHeader('X-PAYMENT-RESPONSE', b64);
    } catch (e) {
      const errPayload = { success: false, error: String(e) };
      const b64 = Buffer.from(JSON.stringify(errPayload)).toString('base64');
      res.setHeader('X-PAYMENT-RESPONSE', b64);
    }

    res.json({
      service: 'weather',
      description,
      city: targetCity,
      current: {
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed
      },
      forecast: weatherData.forecast,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather service error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/healthz', (_req: any, res: any) => res.json({
  ok: true,
  service: 'weather',
  facilitator: FACILITATOR_URL
}));

app.listen(PORT, () => {
  console.log(`Weather service listening on port ${PORT}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
});
