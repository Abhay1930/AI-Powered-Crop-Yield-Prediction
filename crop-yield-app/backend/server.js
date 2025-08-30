const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/farm', require('./routes/farm'));
app.use('/prediction', require('./routes/prediction'));
app.use('/analytics', require('./routes/analytics'));

// Historical data endpoint
app.get('/historical', async (req, res) => {
  try {
    const Prediction = require('./models/Prediction');
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(10);
    
    // Transform data for frontend
    const historicalData = predictions.map(pred => ({
      year: pred.crop_year || new Date(pred.createdAt).getFullYear(),
      predicted_production: pred.predicted_production || 0,
      yield_per_hectare: pred.yield_per_hectare || 0,
      crop_type: pred.crop_type,
      state: pred.state || 'Unknown',
      district: pred.district || 'Unknown',
      season: pred.season || 'Unknown',
      area: pred.area || 0
    }));
    
    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
 });

const PORT = 5001; // Force port 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
