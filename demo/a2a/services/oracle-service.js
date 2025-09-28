const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5407;

// Oracle service endpoint
app.post('/oracle', async (req, res) => {
  try {
    const { service, description, timestamp } = req.body;

    console.log(`🔮 ORACLE: Processing ${service} request`);

    // Call the Python oracle service with virtual environment
    const pythonScript = path.join(__dirname, 'oracle.py');
    const python = spawn('python3', [pythonScript], {
      cwd: __dirname,
      env: {
        ...process.env,
        PATH: path.join(__dirname, 'venv', 'bin') + ':' + process.env.PATH
      }
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
              service: 'oracle',
              description: description,
              data: output.trim(),
              timestamp: timestamp || new Date().toISOString()
            };
          }

          res.json({
            service: 'oracle',
            description: description,
            result: result,
            timestamp: timestamp || new Date().toISOString()
          });
        } catch (parseError) {
          res.json({
            service: 'oracle',
            description: description,
            error: 'Failed to parse service output',
            data: output,
            timestamp: timestamp || new Date().toISOString()
          });
        }
      } else {
        res.status(500).json({
          service: 'oracle',
          description: description,
          error: `Service failed with code ${code}`,
          stderr: error,
          timestamp: timestamp || new Date().toISOString()
        });
      }
    });

    python.on('error', (err) => {
      res.status(500).json({
        service: 'oracle',
        description: description,
        error: `Failed to start service: ${err.message}`,
        timestamp: timestamp || new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Oracle service error:', error);
    res.status(500).json({
      service: 'oracle',
      description: req.body.description,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/healthz', (req, res) => res.json({ ok: true, service: 'oracle' }));

app.listen(PORT, () => {
  console.log(`Oracle service listening on port ${PORT}`);
});
