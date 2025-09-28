const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5405;

// Mock weather data
const mockWeatherData = {
  'London': { temperature: 15, condition: 'Partly Cloudy', humidity: 65 },
  'New York': { temperature: 22, condition: 'Sunny', humidity: 45 },
  'Tokyo': { temperature: 18, condition: 'Rainy', humidity: 80 },
  'America': { temperature: 20, condition: 'Clear', humidity: 50 }
};

app.post('/weather', async (req, res) => {
  try {
    const { service, description, timestamp } = req.body;
    console.log(`🌤️ WEATHER: Processing ${service} request`);

    // Simple weather response
    const weatherData = {
      service: 'weather',
      timestamp: new Date().toISOString(),
      data: {
        locations: Object.keys(mockWeatherData).map(city => ({
          city,
          ...mockWeatherData[city]
        }))
      }
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather service error:', error);
    res.status(500).json({ error: 'Weather service failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Weather service listening on port ${PORT}`);
});
