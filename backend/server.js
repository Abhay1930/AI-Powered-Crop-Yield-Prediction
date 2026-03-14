const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ee = require('@google/earthengine');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cache for 10 minutes to reduce API calls
const weatherCache = new NodeCache({ stdTTL: 600 });

const PORT = process.env.PORT || 5001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'krishiai_secret_key_sih_2024';

// Connect to MongoDB if URI is provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI provided in .env - skipping MongoDB connection');
}

// Google Earth Engine Initialization
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, 'service-account.json');
let eeInitialized = false;

const initializeGEE = () => {
  try {
    if (fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
      const privateKey = require(SERVICE_ACCOUNT_KEY_PATH);
      ee.data.authenticateViaPrivateKey(
        privateKey,
        () => {
          ee.initialize(
            null,
            null,
            () => {
              console.log('Google Earth Engine initialized successfully');
              eeInitialized = true;
            },
            (err) => console.error('GEE initialization failed:', err)
          );
        },
        (err) => console.error('GEE authentication failed:', err)
      );
    } else {
      console.warn('GEE service-account.json not found. Satellite features will be disabled.');
    }
  } catch (error) {
    console.error('Error during GEE setup:', error.message);
  }
};

initializeGEE();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferred_language: { type: String, default: 'en' },
  profile_info: {
    farm_size: Number,
    location: String,
    primary_crop: String
  },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Mongoose Schema for Predictions
const predictionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  crop_type: String,
  state: String,
  yield: Number,
  confidence: Number,
  feature_importance: Object,
  advisory: Object,
  date: { type: Date, default: Date.now },
  inputs: Object
});

const Prediction = mongoose.model('Prediction', predictionSchema);

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return next(); // Allow non-logged in users for now but user_id will be null

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, preferred_language: user.preferred_language } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Proxies prediction request to ML service and saves to history
app.post('/api/predict', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
    const predictionData = response.data;

    // Save to MongoDB history if connected
    if (mongoose.connection.readyState === 1) {
      const newPrediction = new Prediction({
        user_id: req.user ? req.user.id : null,
        crop_type: req.body.crop_type,
        state: req.body.state || 'Unknown',
        yield: predictionData.yield,
        confidence: predictionData.confidence,
        feature_importance: predictionData.feature_importance,
        advisory: predictionData.advisory,
        inputs: req.body
      });
      await newPrediction.save();
    }

    res.json(predictionData);
  } catch (error) {
    console.error('Error calling ML service:', error.message);
    res.status(500).json({ error: 'Failed to predict yield' });
  }
});

// GET History (Filtered by user if logged in)
app.get('/api/history', auth, async (req, res) => {
  try {
    const query = req.user ? { user_id: req.user.id } : {};
    const history = await Prediction.find(query).sort({ date: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Mock endpoints for weather and soil
app.get('/api/weather', (req, res) => {
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
    return res.json(cachedData);
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await axios.get(weatherUrl);
      const { temp, humidity } = response.data.main;
      const { name } = response.data;
      const rainfall = response.data.rain ? response.data.rain['1h'] * 24 : (Math.random() * 20 + 80);

      const realtimeData = {
        temperature: temp,
        humidity: humidity,
        rainfall: rainfall,
        condition: response.data.weather[0].main,
        locationName: name
      };

      weatherCache.set(cacheKey, realtimeData);
      return res.json(realtimeData);
    } else {
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

// Satellite Crop Health Monitoring (NDVI)
app.get('/api/ndvi', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon parameters' });
  }

  if (!eeInitialized) {
    return res.status(503).json({
      error: 'Satellite monitoring service is not initialized. Please ensure service-account.json is provided.'
    });
  }

  try {
    const point = ee.Geometry.Point([parseFloat(lon), parseFloat(lat)]);
    const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(point)
      .filterDate(ee.Date(Date.now()).advance(-30, 'day'), ee.Date(Date.now()))
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
      .sort('CLOUDY_PIXEL_PERCENTAGE')
      .first();

    if (!s2) {
      return res.status(404).json({ error: 'No suitable satellite imagery found for this location in the last 30 days.' });
    }

    const ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI');
    
    // NDWI = (NIR - SWIR) / (NIR + SWIR) -> For plant water stress
    const ndwi = s2.normalizedDifference(['B8', 'B11']).rename('NDWI');
    
    // EVI = 2.5 * ((NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1))
    const evi = s2.expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
        'NIR': s2.select('B8'),
        'RED': s2.select('B4'),
        'BLUE': s2.select('B2')
      }
    ).rename('EVI');

    // Get values at the point
    const combined = ndvi.addBands(ndwi).addBands(evi);
    const stats = combined.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point,
      scale: 10
    }).getInfo();

    let classification = 'Unknown';
    if (stats.NDVI > 0.6) classification = 'Excellent Health';
    else if (stats.NDVI > 0.3) classification = 'Moderate Health';
    else if (stats.NDVI > 0.1) classification = 'Stressed Vegetation';
    else classification = 'Non-Vegetated';

    // Generate Tile URLs for all indices
    const getTileUrl = (img, palette) => {
      const mapId = img.getMap({ min: -1, max: 1, palette });
      return `https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`;
    };

    res.json({
      indices: {
        ndvi: parseFloat(stats.NDVI?.toFixed(3) || 0),
        ndwi: parseFloat(stats.NDWI?.toFixed(3) || 0),
        evi: parseFloat(stats.EVI?.toFixed(3) || 0)
      },
      classification,
      tiles: {
        ndvi: getTileUrl(ndvi, ['red', 'yellow', 'green']),
        ndwi: getTileUrl(ndwi, ['brown', 'white', 'blue']),
        evi: getTileUrl(evi, ['grey', 'yellow', 'darkgreen'])
      },
      date: s2.get('system:time_start').getInfo()
    });
  } catch (error) {
    console.error('GEE NDVI Error:', error.message);
    if (error.message.includes('Quota') || error.message.includes('billing')) {
      return res.status(403).json({ error: 'Earth Engine Quota exceeded or Billing not active. Please check your GCP console.' });
    }
    res.status(500).json({ error: 'Satellite data sync failed: ' + error.message });
  }
});

app.get('/api/ndvi-timeline', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon parameters' });
  }

  if (!eeInitialized) {
    return res.status(503).json({ error: 'Satellite service not initialized' });
  }

  try {
    const point = ee.Geometry.Point([parseFloat(lon), parseFloat(lat)]);
    const collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(point)
      .filterDate(ee.Date(Date.now()).advance(-90, 'day'), ee.Date(Date.now()))
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30));

    const ndviList = collection.map((img) => {
      const ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
      const mean = ndvi.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point,
        scale: 10
      }).get('NDVI');
      return img.set('NDVI_mean', mean);
    }).filter(ee.Filter.notNull(['NDVI_mean']));

    const results = ndviList.reduceColumns({
      reducer: ee.Reducer.toList(2),
      selectors: ['system:time_start', 'NDVI_mean']
    }).get('list').getInfo();

    const timeline = results.map(item => ({
      date: new Date(item[0]).toLocaleDateString(),
      timestamp: item[0],
      ndvi: parseFloat(item[1].toFixed(3))
    })).sort((a, b) => a.timestamp - b.timestamp);

    res.json(timeline);
  } catch (error) {
    console.error('GEE Timeline Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch NDVI timeline' });
  }
});

// Mandi Price Insights (Odisha Focused)
app.get('/api/mandi', async (req, res) => {
  const { crop = 'Rice' } = req.query;
  
  // Real-world data would fetch from data.gov.in or similar API
  // Mock data tailored for Odisha SIH pitch
  const mandiData = {
    'Rice': { price: 2183, change: '+2.5%', trend: 'up', locations: ['Bhubaneswar', 'Cuttack', 'Sambalpur'] },
    'Maize': { price: 1960, change: '+1.2%', trend: 'up', locations: ['Ganjam', 'Nabarangpur'] },
    'Potato': { price: 1450, change: '-0.5%', trend: 'down', locations: ['Puri', 'Balasore'] },
    'Tomato': { price: 2200, change: '+15.0%', trend: 'up', locations: ['Keonjhar', 'Angul'] }
  };

  const cropData = mandiData[crop] || mandiData['Rice'];
  
  res.json({
    crop,
    avgPrice: cropData.price,
    unit: 'Quintal',
    currency: 'INR',
    priceChange: cropData.change,
    trend: cropData.trend,
    topMandis: cropData.locations,
    lastUpdated: new Date().toISOString()
  });
});

// ─── KrishiGPT AI Chat (Gemini 2.0 Flash) ─────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message, language = 'en', context = {} } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const langInstructions = {
    'en': 'Respond in clear, simple English.',
    'hi': 'हिंदी में सरल और स्पष्ट भाषा में जवाब दें।',
    'or': 'ଓଡ଼ିଆ ଭାଷାରେ ସ୍ପଷ୍ଟ ଭାବରେ ଉତ୍ତର ଦିଅ।'
  };

  const systemPrompt = `You are KrishiAI, an expert agricultural assistant for small-scale Indian farmers, especially in Odisha. 
You specialize in:
- Crop management (Rice, Wheat, Maize, Cotton, Potato)
- Soil health, fertilizer, and irrigation recommendations
- Pest and disease identification and treatment
- Market prices and best selling strategies (Mandi/APMC)
- Government schemes (PM-KISAN, KALIA, PMFBY) 
- Weather-based farming decisions

Current context: ${JSON.stringify(context)}
${langInstructions[language] || langInstructions['en']}

Be concise, practical, and use simple language. Use emojis for key points. If asked about prices, mention Odisha Mandis.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nFarmer Question: ' + message }] }
      ]
    });
    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    res.status(500).json({ error: 'AI service is temporarily unavailable. Please try again.', details: error.message });
  }
});

// ─── AI Advisory Narration ─────────────────────────────────────────────────
app.post('/api/ai-advisory', async (req, res) => {
  const { predictionData, farmData, language = 'en' } = req.body;
  if (!predictionData) return res.status(400).json({ error: 'No prediction data provided' });

  const langInstructions = {
    'en': 'Write in clear, farmer-friendly English.',
    'hi': 'किसान के लिए सरल हिंदी में लिखें।',
    'or': 'ଚାଷୀ ପାଇଁ ସରଳ ଓଡ଼ିଆ ଭାଷାରେ ଲେଖ।'
  };

  const prompt = `You are an expert agricultural AI advisor for Indian farmers. 
Based on the following crop data and yield prediction, write a CONCISE (3-4 sentences) personalized farm advisory.
${langInstructions[language] || langInstructions['en']}

Farm Data:
- Crop: ${farmData?.crop_type || 'Unknown'}
- State: ${farmData?.state || 'Odisha'}
- Temperature: ${farmData?.temperature}°C
- Humidity: ${farmData?.humidity}%
- Rainfall: ${farmData?.rainfall}mm
- Soil pH: ${farmData?.soil_ph}
- Nitrogen: ${farmData?.soil_n} kg/ha

AI Prediction:
- Estimated Yield: ${predictionData?.yield?.toLocaleString()} kg/ha
- Confidence: ${(predictionData?.confidence * 100)?.toFixed(0)}%

Write a brief, encouraging, and actionable narrative advisory for this farmer. 
Start with a summary of the yield outlook, then give 1-2 specific action items.
Use simple language and include relevant emojis.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const narrative = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    res.json({ narrative, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Gemini Advisory Error:', error.message);
    res.status(500).json({ error: 'AI narrative failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
