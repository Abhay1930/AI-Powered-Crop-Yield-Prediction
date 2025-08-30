# Advanced Analytics Dashboard

## Overview

The Advanced Analytics Dashboard is a comprehensive data visualization and analysis platform for crop yield prediction and agricultural insights. It provides farmers and agricultural professionals with detailed analytics, trend analysis, and real-time weather integration to make data-driven farming decisions.

## Features

### 🌾 Yield Trend Analysis
- **Historical Patterns**: View production trends over multiple years
- **Forecasting**: Predict future yields based on historical data
- **Interactive Charts**: Line charts showing production vs yield per hectare
- **Trend Insights**: Automated analysis of production patterns

### 📊 Crop Performance Comparison
- **Multi-Crop Analysis**: Compare different crops side-by-side
- **Efficiency Metrics**: Production, yield, and area comparisons
- **Performance Rankings**: Identify best-performing crops
- **Visual Comparisons**: Bar charts and detailed metrics

### 🌤️ Seasonal Analysis
- **Season-wise Performance**: Kharif, Rabi, and Zaid season analysis
- **Success Rates**: Track seasonal success patterns
- **Year-over-Year Comparison**: Compare seasonal performance across years
- **Seasonal Recommendations**: Optimize planting schedules

### 🗺️ Interactive Geographic Maps
- **District-wise Visualization**: Interactive SVG-based maps
- **Production Heatmaps**: Color-coded production data
- **Geographic Insights**: Regional performance analysis
- **Clickable Districts**: Detailed district information on click

### 🌦️ Real-time Weather Integration
- **Current Weather**: Live weather data with temperature, humidity, pressure
- **5-Day Forecast**: Extended weather predictions
- **Weather Alerts**: Automated alerts for adverse conditions
- **Crop-specific Recommendations**: Weather-based farming advice
- **UV Index & Visibility**: Additional weather metrics

## Technical Architecture

### Frontend Components
- **AdvancedAnalytics.jsx**: Main dashboard component
- **InteractiveMap.jsx**: Geographic visualization component
- **WeatherWidget.jsx**: Weather data and forecast component
- **Chart.js Integration**: Multiple chart types (Line, Bar, Radar, Doughnut)

### Backend APIs
- **Analytics Routes**: `/analytics/*` endpoints for data aggregation
- **Weather Integration**: OpenWeatherMap API integration
- **MongoDB Aggregation**: Advanced data processing and analytics
- **Real-time Data**: Live weather and forecast updates

### Data Sources
- **Historical Predictions**: MongoDB stored prediction data
- **Weather API**: OpenWeatherMap for current and forecast data
- **ML Model Data**: Integration with existing crop prediction model

## Setup Instructions

### 1. Prerequisites
```bash
# Ensure you have Node.js and npm installed
node --version
npm --version

# Install MongoDB (if not already installed)
# Follow MongoDB installation guide for your OS
```

### 2. Backend Setup
```bash
cd crop-yield-app/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and other configs

# Start the backend server
npm start
# Server will run on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd crop-yield-app/frontend

# Install dependencies
npm install

# Install additional chart dependencies
npm install react-chartjs-2 chart.js

# Start the frontend development server
npm start
# App will run on http://localhost:3000
```

### 4. Weather API Setup
1. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Replace `YOUR_OPENWEATHER_API_KEY` in `src/services/api.js` with your actual API key
3. The weather integration will start working automatically

### 5. ML Model Integration
```bash
cd crop-yield-app/ml_model

# Install Python dependencies
pip install -r requirements.txt

# Start the ML model API
python predict_api.py
# ML API will run on http://localhost:8000
```

## Usage Guide

### Accessing the Dashboard
1. Navigate to the application in your browser
2. Click on "Analytics" in the navigation bar
3. The Advanced Analytics Dashboard will load with default data

### Using the Filters
- **Crop Selection**: Choose specific crops for analysis
- **State Selection**: Filter data by Indian states
- **Crop Comparison**: Select multiple crops for comparison
- **Update Analytics**: Refresh data with current selections

### Interpreting the Data
- **Performance Metrics**: View key indicators at the top
- **Tab Navigation**: Switch between different analysis views
- **Interactive Elements**: Hover over charts and maps for details
- **Weather Alerts**: Pay attention to weather warnings and recommendations

## API Endpoints

### Analytics Endpoints
- `GET /analytics/yield-trends` - Historical yield trend data
- `POST /analytics/crop-comparison` - Multi-crop performance comparison
- `GET /analytics/seasonal` - Seasonal analysis data
- `GET /analytics/geographic` - Geographic distribution data
- `POST /analytics/performance` - Performance metrics
- `GET /analytics/insights/:id` - Detailed prediction insights

### Weather Endpoints
- `GET /weather/current` - Current weather data
- `GET /weather/forecast` - 5-day weather forecast
- `GET /weather/alerts` - Weather alerts and warnings

## Data Structure

### Yield Trends Data
```json
{
  "year": 2024,
  "production": 4500,
  "yield_per_hectare": 4.8,
  "area": 950
}
```

### Crop Comparison Data
```json
{
  "crop": "Rice",
  "production": 5200,
  "yield_per_hectare": 5.2,
  "area": 1000,
  "efficiency": 85.5
}
```

### Weather Data
```json
{
  "main": {
    "temp": 28,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [{
    "description": "Partly cloudy",
    "icon": "02d"
  }],
  "wind": {
    "speed": 5.2
  }
}
```

## Customization

### Adding New Charts
1. Import new chart types from `react-chartjs-2`
2. Create chart data and options
3. Add new tab in the dashboard
4. Update API endpoints if needed

### Extending Weather Integration
1. Add new weather APIs in `src/services/api.js`
2. Update `WeatherWidget.jsx` with new metrics
3. Enhance crop recommendations based on new data

### Geographic Customization
1. Update district coordinates in `InteractiveMap.jsx`
2. Add new states and districts
3. Customize color schemes and legends

## Troubleshooting

### Common Issues
1. **Weather data not loading**: Check API key configuration
2. **Charts not rendering**: Ensure Chart.js dependencies are installed
3. **Backend connection errors**: Verify MongoDB connection and server status
4. **ML model integration**: Check if Python API is running on port 8000

### Performance Optimization
- Use data caching for frequently accessed analytics
- Implement pagination for large datasets
- Optimize chart rendering with proper data limits
- Use lazy loading for weather data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**Note**: This Advanced Analytics Dashboard is designed to work with the existing Crop Yield Prediction system. Ensure all components are properly configured and running for optimal functionality.
