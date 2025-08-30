# AI-Powered Crop Yield Prediction

A comprehensive crop yield prediction application with advanced analytics and interactive visualizations, built for Smart India Hackathon 2025.

## 🌾 Features

- **AI-Powered Predictions**: Machine learning models for accurate crop yield forecasting
- **Interactive Dashboard**: Real-time analytics with beautiful charts and visualizations
- **Geographic Mapping**: Interactive maps showing district-wise production data
- **Weather Integration**: Real-time weather data and forecasts
- **Multi-Language Support**: Internationalization for broader accessibility
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive data visualizations
- **Leaflet** - Interactive maps
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Machine Learning
- **Python** - ML development
- **Flask** - ML API server
- **Scikit-learn** - Machine learning algorithms
- **Pandas & NumPy** - Data processing
- **Joblib** - Model serialization

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhay1930/AI-Powered-Crop-Yield-Prediction.git
   cd AI-Powered-Crop-Yield-Prediction
   ```

2. **Backend Setup**
   ```bash
   cd crop-yield-app/backend
   npm install
   npm start
   ```

3. **ML Model Setup**
   ```bash
   cd crop-yield-app/ml_model
   pip install -r requirements.txt
   python app.py
   ```

4. **Frontend Setup**
   ```bash
   cd crop-yield-app/frontend
   npm install --legacy-peer-deps
   npm start
   ```

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Optional: OpenWeather API Key for real weather data
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Backend API URL (default: http://localhost:5001)
REACT_APP_BACKEND_URL=http://localhost:5001

# ML Model API URL (default: http://localhost:8000)
REACT_APP_ML_API_URL=http://localhost:8000
```

## 📱 Usage

1. **Start all services**:
   - Backend server: `http://localhost:5001`
   - ML model server: `http://localhost:8000`
   - Frontend application: `http://localhost:3000`

2. **Make Predictions**:
   - Select state, district, season, and crop
   - Enter area and crop year
   - Get AI-powered production forecasts

3. **Explore Analytics**:
   - View yield trends and comparisons
   - Analyze seasonal patterns
   - Explore interactive geographic maps
   - Monitor weather conditions

## 🎯 API Endpoints

### Backend API (Port 5001)
- `POST /prediction` - Get crop yield predictions
- `GET /historical` - Fetch historical prediction data
- `GET /test` - Health check endpoint

### ML API (Port 8000)
- `POST /predict/basic` - Basic crop yield prediction
- `POST /predict/complete` - Advanced prediction with insights
- `GET /health` - ML service health check
- `GET /unique-values` - Get available crops, states, seasons

## 📊 Data Sources

- **Crop Data**: Historical yield and production statistics
- **Weather Data**: OpenWeatherMap API (optional)
- **Geographic Data**: District and state mapping information
- **Soil Data**: Integrated soil analysis parameters

## 🤖 Machine Learning Model

The ML model uses:
- **Random Forest Regressor** for yield prediction
- **Feature Engineering** with state, district, season, crop, year, and area
- **Label Encoding** for categorical variables
- **Standard Scaling** for numerical features
- **Cross-validation** for model evaluation

## 🗺️ Interactive Features

- **Geographic Visualization**: Leaflet-based interactive maps
- **Production Heatmaps**: Color-coded district performance
- **Click Interactions**: Detailed district information on click
- **Responsive Charts**: Dynamic data visualization with Chart.js
- **Real-time Updates**: Live data refresh capabilities

## 🌐 Deployment

The application supports deployment on various platforms:
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **ML API**: Python hosting services
- **Database**: MongoDB Atlas (cloud)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Abhay** - Full Stack Developer & ML Engineer
- Built for Smart India Hackathon 2025

## 🙏 Acknowledgments

- Smart India Hackathon 2025 organizers
- OpenWeatherMap for weather data API
- OpenStreetMap for mapping services
- Agricultural departments for crop data insights

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your Email]

---

**Made with ❤️ for Smart India Hackathon 2025**
