const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  crop_type: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  season: { type: String, required: true },
  crop_year: { type: Number, required: true },
  area: { type: Number, required: true },
  
  // Legacy fields (for backward compatibility)
  soil_ph: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  rainfall: Number,
  temperature: Number,
  
  // New prediction fields
  predicted_yield: Number,
  predicted_production: Number,
  
  // Insights and recommendations
  production_analysis: String,
  yield_analysis: String,
  recommendations: [String],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
