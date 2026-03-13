const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cache for 10 minutes to reduce API calls
const weatherCache = new NodeCache({ stdTTL: 600 });

const PORT = process.env.PORT || 5001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Connect to MongoDB if URI is provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI provided in .env - skipping MongoDB connection');
}

// Proxies prediction request to ML service
app.post('/api/predict', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling ML service:', error.message);
    res.status(500).json({ error: 'Failed to predict yield' });
  }
});

// Mock endpoints for weather and soil
app.get('/api/weather', (req, res) => {
  // Mock data for weather based on lat/lon
  res.json({
    temperature: 28 + (Math.random() * 5 - 2.5),
    humidity: 60 + (Math.random() * 10 - 5),
    rainfall: 120 + (Math.random() * 20 - 10),
    condition: 'Sunny'
  });
});

app.get('/api/soil', (req, res) => {
  res.json({
    ph: 6.5 + (Math.random() * 0.5 - 0.25),
    nitrogen: 45 + (Math.random() * 10 - 5),
    moisture: 40 + (Math.random() * 10 - 5)
  });
});

// Realtime Weather from OpenWeatherMap + Auto-Location API
app.get('/api/weather-live', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon parameters' });
  }

  const cacheKey = `${lat},${lon}`;
  const cachedData = weatherCache.get(cacheKey);

  if (cachedData) {
    console.log('Serving weather from cache');
    return res.json(cachedData);
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // If real key exists, use it. Otherwise, return mock data specific to lat/lon.
    if (apiKey) {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await axios.get(weatherUrl);
      
      const { temp, humidity } = response.data.main;
      const { name } = response.data;
      
      // Simulate rainfall since OpenWeatherMap standard endpoint doesn't always include it (1hr/3hr volume)
      const rainfall = response.data.rain ? response.data.rain['1h'] * 24 : (Math.random() * 20 + 80); 
      
      const realtimeData = {
        temperature: temp,
        humidity: humidity,
        rainfall: rainfall, // Optional calculation
        condition: response.data.weather[0].main,
        locationName: name
      };

      weatherCache.set(cacheKey, realtimeData);
      return res.json(realtimeData);

    } else {
      // Mock data representing realtime
      const mockRealtime = {
        temperature: 28 + (Math.random() * 5 - 2.5),
        humidity: 60 + (Math.random() * 10 - 5),
        rainfall: 120 + (Math.random() * 20 - 10),
        condition: 'Sunny (Mocked Live)',
        locationName: 'Simulated Location'
      };
      
      weatherCache.set(cacheKey, mockRealtime);
      return res.json(mockRealtime);
    }

  } catch (error) {
    console.error('Error fetching live weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch realtime weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
