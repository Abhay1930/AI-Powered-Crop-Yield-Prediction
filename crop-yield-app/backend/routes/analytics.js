const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');

// Get geographic data for states
router.get('/geographic', async (req, res) => {
  try {
    const { state } = req.query;
    let query = {};
    
    if (state) {
      query.state = state;
    }
    
    const predictions = await Prediction.find(query);
    
    // Process data for geographic visualization
    const stateData = {};
    
    predictions.forEach(pred => {
      const stateName = pred.state || 'Unknown';
      if (!stateData[stateName]) {
        stateData[stateName] = {
          state: stateName,
          totalProduction: 0,
          totalArea: 0,
          avgYield: 0,
          predictions: 0,
          crops: new Set(),
          districts: new Set()
        };
      }
      
      stateData[stateName].totalProduction += pred.predicted_production || 0;
      stateData[stateName].totalArea += pred.area || 0;
      stateData[stateName].predictions += 1;
      stateData[stateName].crops.add(pred.crop_type);
      stateData[stateName].districts.add(pred.district);
    });
    
    // Convert sets to arrays and calculate averages
    Object.values(stateData).forEach(state => {
      state.avgYield = state.totalArea > 0 ? state.totalProduction / state.totalArea : 0;
      state.crops = Array.from(state.crops);
      state.districts = Array.from(state.districts);
    });
    
    res.json(Object.values(stateData));
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    res.status(500).json({ error: 'Failed to fetch geographic data' });
  }
});

// Get yield trends for a specific crop and state
router.get('/yield-trends', async (req, res) => {
  try {
    const { crop, state, years = 5 } = req.query;
    let query = {};
    
    if (crop) query.crop_type = crop;
    if (state) query.state = state;
    
    const predictions = await Prediction.find(query)
      .sort({ crop_year: -1 })
      .limit(parseInt(years) * 12); // Assuming multiple predictions per year
    
    // Group by year and calculate averages
    const yearData = {};
    predictions.forEach(pred => {
      const year = pred.crop_year || new Date(pred.createdAt).getFullYear();
      if (!yearData[year]) {
        yearData[year] = {
          year,
          totalProduction: 0,
          totalArea: 0,
          predictions: 0
        };
      }
      
      yearData[year].totalProduction += pred.predicted_production || 0;
      yearData[year].totalArea += pred.area || 0;
      yearData[year].predictions += 1;
    });
    
    // Calculate averages
    Object.values(yearData).forEach(year => {
      year.avgProduction = year.totalProduction / year.predictions;
      year.avgArea = year.totalArea / year.predictions;
      year.avgYield = year.avgArea > 0 ? year.avgProduction / year.avgArea : 0;
    });
    
    res.json(Object.values(yearData).sort((a, b) => a.year - b.year));
  } catch (error) {
    console.error('Error fetching yield trends:', error);
    res.status(500).json({ error: 'Failed to fetch yield trends' });
  }
});

// Get crop comparison data
router.post('/crop-comparison', async (req, res) => {
  try {
    const { crops, state, year } = req.body;
    let query = {};
    
    if (crops && crops.length > 0) query.crop_type = { $in: crops };
    if (state) query.state = state;
    if (year) query.crop_year = parseInt(year);
    
    const predictions = await Prediction.find(query);
    
    // Group by crop
    const cropData = {};
    predictions.forEach(pred => {
      const crop = pred.crop_type;
      if (!cropData[crop]) {
        cropData[crop] = {
          crop,
          totalProduction: 0,
          totalArea: 0,
          predictions: 0
        };
      }
      
      cropData[crop].totalProduction += pred.predicted_production || 0;
      cropData[crop].totalArea += pred.area || 0;
      cropData[crop].predictions += 1;
    });
    
    // Calculate averages and efficiency
    Object.values(cropData).forEach(crop => {
      crop.avgProduction = crop.totalProduction / crop.predictions;
      crop.avgArea = crop.totalArea / crop.predictions;
      crop.avgYield = crop.avgArea > 0 ? crop.avgProduction / crop.avgArea : 0;
      crop.efficiency = crop.avgYield > 0 ? Math.min(100, (crop.avgYield / 5) * 100) : 0; // Assuming 5 tons/ha is 100% efficiency
    });
    
    res.json(Object.values(cropData));
  } catch (error) {
    console.error('Error fetching crop comparison:', error);
    res.status(500).json({ error: 'Failed to fetch crop comparison' });
  }
});

// Get seasonal analysis
router.get('/seasonal', async (req, res) => {
  try {
    const { crop, state, seasons } = req.query;
    let query = {};
    
    if (crop) query.crop_type = crop;
    if (state) query.state = state;
    if (seasons) {
      const seasonArray = seasons.split(',');
      query.season = { $in: seasonArray };
    }
    
    const predictions = await Prediction.find(query);
    
    // Group by season
    const seasonData = {};
    predictions.forEach(pred => {
      const season = pred.season || 'Unknown';
      if (!seasonData[season]) {
        seasonData[season] = {
          season,
          totalProduction: 0,
          totalArea: 0,
          predictions: 0
        };
      }
      
      seasonData[season].totalProduction += pred.predicted_production || 0;
      seasonData[season].totalArea += pred.area || 0;
      seasonData[season].predictions += 1;
    });
    
    // Calculate averages and success rate
    Object.values(seasonData).forEach(season => {
      season.avgProduction = season.totalProduction / season.predictions;
      season.avgArea = season.totalArea / season.predictions;
      season.avgYield = season.avgArea > 0 ? season.avgProduction / season.avgArea : 0;
      season.successRate = season.avgYield > 0 ? Math.min(100, (season.avgYield / 4) * 100) : 0; // Assuming 4 tons/ha is 100% success
    });
    
    res.json(Object.values(seasonData));
  } catch (error) {
    console.error('Error fetching seasonal analysis:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal analysis' });
  }
});

// Get performance metrics
router.post('/performance', async (req, res) => {
  try {
    const { crop, state, district, year } = req.body;
    let query = {};
    
    if (crop) query.crop_type = crop;
    if (state) query.state = state;
    if (district) query.district = district;
    if (year) query.crop_year = parseInt(year);
    
    const predictions = await Prediction.find(query);
    
    if (predictions.length === 0) {
      return res.json({
        totalPredictions: 0,
        accuracyRate: 0,
        averageProduction: 0,
        bestPerformingDistrict: 'N/A',
        seasonalVariance: 0
      });
    }
    
    // Calculate metrics
    const totalProduction = predictions.reduce((sum, pred) => sum + (pred.predicted_production || 0), 0);
    const averageProduction = totalProduction / predictions.length;
    
    // Find best performing district
    const districtPerformance = {};
    predictions.forEach(pred => {
      const district = pred.district || 'Unknown';
      if (!districtPerformance[district]) {
        districtPerformance[district] = {
          district,
          totalProduction: 0,
          predictions: 0
        };
      }
      districtPerformance[district].totalProduction += pred.predicted_production || 0;
      districtPerformance[district].predictions += 1;
    });
    
    const bestDistrict = Object.values(districtPerformance)
      .sort((a, b) => (b.totalProduction / b.predictions) - (a.totalProduction / a.predictions))[0];
    
    // Calculate seasonal variance
    const seasonalData = {};
    predictions.forEach(pred => {
      const season = pred.season || 'Unknown';
      if (!seasonalData[season]) seasonalData[season] = [];
      seasonalData[season].push(pred.predicted_production || 0);
    });
    
    const seasonalAverages = Object.values(seasonalData).map(productions => 
      productions.reduce((sum, prod) => sum + prod, 0) / productions.length
    );
    
    const overallAverage = seasonalAverages.reduce((sum, avg) => sum + avg, 0) / seasonalAverages.length;
    const variance = seasonalAverages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / seasonalAverages.length;
    const seasonalVariance = Math.sqrt(variance);
    
    res.json({
      totalPredictions: predictions.length,
      accuracyRate: 87.5, // Mock accuracy rate
      averageProduction: Math.round(averageProduction),
      bestPerformingDistrict: bestDistrict ? bestDistrict.district : 'N/A',
      seasonalVariance: Math.round(seasonalVariance)
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get insights for a specific prediction
router.get('/insights/:predictionId', async (req, res) => {
  try {
    const { predictionId } = req.params;
    const prediction = await Prediction.findById(predictionId);
    
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    // Generate insights based on prediction data
    const insights = {
      predictionId,
      productionAnalysis: `Expected production of ${prediction.predicted_production?.toFixed(0) || 0} tons`,
      yieldAnalysis: `Average yield of ${prediction.yield_per_hectare?.toFixed(2) || 0} tons per hectare`,
      recommendations: [
        'Consider soil testing for optimal nutrient management',
        'Monitor weather conditions for the selected season',
        'Follow recommended planting dates for better yields',
        'Implement crop rotation practices',
        'Use precision farming techniques'
      ],
      riskFactors: [
        'Weather variability',
        'Pest and disease pressure',
        'Market price fluctuations'
      ]
    };
    
    res.json(insights);
  } catch (error) {
    console.error('Error fetching prediction insights:', error);
    res.status(500).json({ error: 'Failed to fetch prediction insights' });
  }
});

module.exports = router;
