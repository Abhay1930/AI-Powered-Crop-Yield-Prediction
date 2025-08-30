const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction');

// POST /prediction
router.post('/', async (req, res) => {
	try {
		const { state_name, district_name, season, crop, crop_year, area } = req.body;

		// 1. Call Python ML API (using port 8000 to avoid conflict with backend)
		const response = await axios.post('http://127.0.0.1:8000/predict/basic', {
			state: state_name,
			district: district_name,
			season,
			crop,
			year: crop_year,
			area
		});

		const { prediction, inputs, insights } = response.data;

		// 2. Store prediction in MongoDB (will implement after fixing response format)
		// TODO: Fix MongoDB schema to handle object data properly

		// 3. Return result to frontend
		res.json({
			success: true,
			prediction: {
				predicted_production: prediction.predicted_production,
				yield_per_hectare: prediction.yield_per_hectare,
				area_hectares: prediction.area_hectares,
				unit: prediction.unit
			},
			inputs: {
				state: inputs.state,
				district: inputs.district,
				season: inputs.season,
				crop: inputs.crop,
				year: inputs.year,
				area: inputs.area
			},
			insights: {
				production_analysis: insights.production_analysis,
				yield_analysis: insights.yield_analysis,
				recommendations: insights.recommendations
			}
		});

	} catch (error) {
		console.error('Prediction error:', error.message);
		console.error('Error details:', error.response?.data || error);
		res.status(500).json({ 
			error: 'Prediction failed',
			details: error.response?.data || error.message 
		});
	}
});

module.exports = router;
