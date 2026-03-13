const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
