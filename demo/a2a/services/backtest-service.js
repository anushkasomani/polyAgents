const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5409;

// Backtest service endpoint
app.post('/backtest', async (req, res) => {
  try {
    const { service, description, timestamp } = req.body;

    console.log(`📊 BACKTEST: Processing ${service} request`);

    // Call the Python backtest service
    const pythonScript = path.join(__dirname, 'backtest.py');
    const python = spawn('python3', [pythonScript], {
      cwd: __dirname,
      env: { ...process.env }
    });

    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the output as JSON if possible, otherwise return as text
          let result;
          try {
            result = JSON.parse(output);
          } catch {
            result = {
              service: 'backtest',
              description: description,
              data: output.trim(),
              timestamp: timestamp || new Date().toISOString()
            };
          }

          res.json({
            service: 'backtest',
            description: description,
            result: result,
            timestamp: timestamp || new Date().toISOString()
          });
        } catch (parseError) {
          res.json({
            service: 'backtest',
            description: description,
            error: 'Failed to parse service output',
            data: output,
            timestamp: timestamp || new Date().toISOString()
          });
        }
      } else {
        res.status(500).json({
          service: 'backtest',
          description: description,
          error: `Service failed with code ${code}`,
          stderr: error,
          timestamp: timestamp || new Date().toISOString()
        });
      }
    });

    python.on('error', (err) => {
      res.status(500).json({
        service: 'backtest',
        description: description,
        error: `Failed to start service: ${err.message}`,
        timestamp: timestamp || new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Backtest service error:', error);
    res.status(500).json({
      service: 'backtest',
      description: req.body.description,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/healthz', (req, res) => res.json({ ok: true, service: 'backtest' }));

app.listen(PORT, () => {
  console.log(`Backtest service listening on port ${PORT}`);
});


