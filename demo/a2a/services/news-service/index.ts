import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { buildPaymentRequirements, verifyPayment, settlePayment } from '../../orchestrator/x402.js';

const app = express();
app.use(cors({ exposedHeaders: ['X-PAYMENT-RESPONSE'] }));
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5404;
const ADDRESS = process.env.ADDRESS || '0xPayToAddress';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:5401';
const AMOY_USDC_ADDRESS = process.env.AMOY_USDC_ADDRESS || '0xAmoyUSDC';

// Mock news data
const mockNewsData = {
  'BTC': [
    { title: 'Bitcoin reaches new all-time high', source: 'CoinDesk', time: '2 hours ago', sentiment: 'positive' },
    { title: 'Major institution adopts Bitcoin', source: 'Reuters', time: '4 hours ago', sentiment: 'positive' }
  ],
  'ETH': [
    { title: 'Ethereum network upgrade successful', source: 'Ethereum Foundation', time: '1 hour ago', sentiment: 'positive' },
    { title: 'Gas fees drop significantly', source: 'DeFi Pulse', time: '3 hours ago', sentiment: 'positive' }
  ],
  'DOGE': [
    { title: 'Dogecoin community celebrates milestone', source: 'Reddit', time: '30 minutes ago', sentiment: 'positive' },
    { title: 'Elon Musk mentions DOGE again', source: 'Twitter', time: '1 hour ago', sentiment: 'neutral' }
  ]
};

app.post('/news', async (req: any, res: any) => {
  const paymentHeader = req.headers['x-payment'] as string | undefined;

  if (!paymentHeader) {
    const resourceUrl = `http://localhost:${PORT}/news`;
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
    console.log(`News service executing: ${description}`);

    // Extract cryptocurrency symbols from description
    const symbols = ['BTC', 'ETH', 'DOGE'].filter(symbol =>
      description.toLowerCase().includes(symbol.toLowerCase())
    );

    // If no specific symbols mentioned, return general crypto news
    const targetSymbols = symbols.length > 0 ? symbols : ['BTC', 'ETH'];

    const newsResults: any[] = [];
    for (const symbol of targetSymbols) {
      if (mockNewsData[symbol]) {
        newsResults.push({
          symbol,
          news: mockNewsData[symbol]
        });
      }
    }

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
      service: 'news',
      description,
      results: newsResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News service error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/healthz', (_req: any, res: any) => res.json({
  ok: true,
  service: 'news',
  facilitator: FACILITATOR_URL
}));

app.listen(PORT, () => {
  console.log(`News service listening on port ${PORT}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
});
