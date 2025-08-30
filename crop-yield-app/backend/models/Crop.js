const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  cropType: { type: String, required: true },
  soilMetrics: { type: Object, required: true },
  historicalYields: [{ year: Number, yield: Number }],
});

module.exports = mongoose.model('Crop', CropSchema);
