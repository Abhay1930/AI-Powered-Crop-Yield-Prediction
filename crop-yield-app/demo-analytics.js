const mongoose = require('mongoose');
const Prediction = require('./backend/models/Prediction');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = 'mongodb://localhost:27017/crop_yield_db';

// Sample data for different crops, states, and years
const sampleData = [
  // Rice data
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop_year: 2020, area: 1000, predicted_yield: 4.5, predicted_production: 4500 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop_year: 2021, area: 1050, predicted_yield: 4.8, predicted_production: 5040 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop_year: 2022, area: 1100, predicted_yield: 5.2, predicted_production: 5720 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop_year: 2023, area: 1150, predicted_yield: 4.9, predicted_production: 5635 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop_year: 2024, area: 1200, predicted_yield: 5.5, predicted_production: 6600 },
  
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Nashik', season: 'Kharif', crop_year: 2020, area: 800, predicted_yield: 4.2, predicted_production: 3360 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Nashik', season: 'Kharif', crop_year: 2021, area: 850, predicted_yield: 4.5, predicted_production: 3825 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Nashik', season: 'Kharif', crop_year: 2022, area: 900, predicted_yield: 4.8, predicted_production: 4320 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Nashik', season: 'Kharif', crop_year: 2023, area: 950, predicted_yield: 4.6, predicted_production: 4370 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Nashik', season: 'Kharif', crop_year: 2024, area: 1000, predicted_yield: 5.0, predicted_production: 5000 },

  // Wheat data
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Rabi', crop_year: 2020, area: 1200, predicted_yield: 3.8, predicted_production: 4560 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Rabi', crop_year: 2021, area: 1250, predicted_yield: 4.0, predicted_production: 5000 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Rabi', crop_year: 2022, area: 1300, predicted_yield: 4.2, predicted_production: 5460 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Rabi', crop_year: 2023, area: 1350, predicted_yield: 3.9, predicted_production: 5265 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Rabi', crop_year: 2024, area: 1400, predicted_yield: 4.5, predicted_production: 6300 },

  // Maize data
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Nagpur', season: 'Kharif', crop_year: 2020, area: 600, predicted_yield: 6.5, predicted_production: 3900 },
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Nagpur', season: 'Kharif', crop_year: 2021, area: 650, predicted_yield: 6.8, predicted_production: 4420 },
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Nagpur', season: 'Kharif', crop_year: 2022, area: 700, predicted_yield: 7.2, predicted_production: 5040 },
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Nagpur', season: 'Kharif', crop_year: 2023, area: 750, predicted_yield: 6.9, predicted_production: 5175 },
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Nagpur', season: 'Kharif', crop_year: 2024, area: 800, predicted_yield: 7.5, predicted_production: 6000 },

  // Cotton data
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Solapur', season: 'Kharif', crop_year: 2020, area: 900, predicted_yield: 2.8, predicted_production: 2520 },
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Solapur', season: 'Kharif', crop_year: 2021, area: 950, predicted_yield: 3.0, predicted_production: 2850 },
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Solapur', season: 'Kharif', crop_year: 2022, area: 1000, predicted_yield: 3.2, predicted_production: 3200 },
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Solapur', season: 'Kharif', crop_year: 2023, area: 1050, predicted_yield: 2.9, predicted_production: 3045 },
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Solapur', season: 'Kharif', crop_year: 2024, area: 1100, predicted_yield: 3.4, predicted_production: 3740 },

  // Sugarcane data
  { crop_type: 'Sugarcane', state: 'Maharashtra', district: 'Kolhapur', season: 'Kharif', crop_year: 2020, area: 1500, predicted_yield: 85.0, predicted_production: 127500 },
  { crop_type: 'Sugarcane', state: 'Maharashtra', district: 'Kolhapur', season: 'Kharif', crop_year: 2021, area: 1550, predicted_yield: 88.0, predicted_production: 136400 },
  { crop_type: 'Sugarcane', state: 'Maharashtra', district: 'Kolhapur', season: 'Kharif', crop_year: 2022, area: 1600, predicted_yield: 92.0, predicted_production: 147200 },
  { crop_type: 'Sugarcane', state: 'Maharashtra', district: 'Kolhapur', season: 'Kharif', crop_year: 2023, area: 1650, predicted_yield: 89.0, predicted_production: 146850 },
  { crop_type: 'Sugarcane', state: 'Maharashtra', district: 'Kolhapur', season: 'Kharif', crop_year: 2024, area: 1700, predicted_yield: 95.0, predicted_production: 161500 },

  // Additional districts for geographic analysis
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Mumbai', season: 'Kharif', crop_year: 2024, area: 500, predicted_yield: 4.0, predicted_production: 2000 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Thane', season: 'Rabi', crop_year: 2024, area: 700, predicted_yield: 3.5, predicted_production: 2450 },
  { crop_type: 'Maize', state: 'Maharashtra', district: 'Mumbai', season: 'Kharif', crop_year: 2024, area: 300, predicted_yield: 6.0, predicted_production: 1800 },
  { crop_type: 'Cotton', state: 'Maharashtra', district: 'Thane', season: 'Kharif', crop_year: 2024, area: 400, predicted_yield: 2.5, predicted_production: 1000 },

  // Seasonal variations
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Rabi', crop_year: 2024, area: 800, predicted_yield: 4.2, predicted_production: 3360 },
  { crop_type: 'Rice', state: 'Maharashtra', district: 'Pune', season: 'Zaid', crop_year: 2024, area: 400, predicted_yield: 3.8, predicted_production: 1520 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Kharif', crop_year: 2024, area: 600, predicted_yield: 3.2, predicted_production: 1920 },
  { crop_type: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', season: 'Zaid', crop_year: 2024, area: 300, predicted_yield: 2.8, predicted_production: 840 },

  // Other states for comparison
  { crop_type: 'Rice', state: 'Punjab', district: 'Amritsar', season: 'Kharif', crop_year: 2024, area: 1500, predicted_yield: 6.2, predicted_production: 9300 },
  { crop_type: 'Wheat', state: 'Punjab', district: 'Ludhiana', season: 'Rabi', crop_year: 2024, area: 1800, predicted_yield: 5.5, predicted_production: 9900 },
  { crop_type: 'Maize', state: 'Uttar Pradesh', district: 'Lucknow', season: 'Kharif', crop_year: 2024, area: 1200, predicted_yield: 7.8, predicted_production: 9360 },
  { crop_type: 'Cotton', state: 'Karnataka', district: 'Bangalore', season: 'Kharif', crop_year: 2024, area: 800, predicted_yield: 3.5, predicted_production: 2800 }
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Prediction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample data
    const predictions = sampleData.map(data => ({
      ...data,
      recommendations: [
        'Monitor soil moisture levels',
        'Follow recommended planting dates',
        'Consider crop rotation for soil health'
      ],
      production_analysis: `Good production potential with ${data.predicted_production} tons expected.`,
      yield_analysis: `Average yield expected: ${data.predicted_yield} tons/hectare.`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Prediction.insertMany(predictions);
    console.log(`✅ Inserted ${predictions.length} sample predictions`);

    // Verify data
    const count = await Prediction.countDocuments();
    console.log(`📊 Total predictions in database: ${count}`);

    // Show sample queries
    console.log('\n🔍 Sample Analytics Queries:');
    console.log('1. Yield trends for Rice in Maharashtra: GET /analytics/yield-trends?crop=Rice&state=Maharashtra');
    console.log('2. Crop comparison: POST /analytics/crop-comparison with body: {"crops":["Rice","Wheat"],"state":"Maharashtra","year":2024}');
    console.log('3. Seasonal analysis: GET /analytics/seasonal?crop=Rice&state=Maharashtra&seasons=Kharif,Rabi,Zaid');
    console.log('4. Geographic data: GET /analytics/geographic?state=Maharashtra');
    console.log('5. Performance metrics: POST /analytics/performance with body: {"crop":"Rice","state":"Maharashtra"}');

    console.log('\n🎉 Database populated successfully!');
    console.log('🚀 You can now test the Advanced Analytics Dashboard');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateDatabase();
