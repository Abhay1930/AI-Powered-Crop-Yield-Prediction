# Crop Yield Prediction App

A comprehensive crop yield prediction application with advanced analytics and interactive visualizations.

## Project Structure

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React.js + Tailwind CSS + Chart.js
- **ML Model**: Python + Scikit-learn

## Features

- 🌾 Crop yield prediction using machine learning
- 📊 Advanced analytics and data visualization
- 🗺️ Interactive geographic mapping
- 🌤️ Weather integration (optional)
- 📱 Responsive design
- 🌍 Multi-language support

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crop-yield-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **ML Model Setup**
   ```bash
   cd ml_model
   pip install -r requirements.txt
   python app.py
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

Create a `.env` file in the frontend directory (copy from `env.example`):

```bash
# Optional: OpenWeather API Key for real weather data
# Get your free API key from: https://openweathermap.org/api
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Backend API URL (default: http://localhost:5001)
REACT_APP_BACKEND_URL=http://localhost:5001

# ML Model API URL (default: http://localhost:8000)
REACT_APP_ML_API_URL=http://localhost:8000
```

### Running the Application

1. **Start the backend server** (port 5001)
2. **Start the ML model server** (port 8000)
3. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## API Keys

### OpenWeather API (Optional)
- **Purpose**: Real-time weather data and forecasts
- **Cost**: Free tier available (1000 calls/day)
- **Setup**: 
  1. Sign up at https://openweathermap.org/api
  2. Get your API key
  3. Add it to your `.env` file as `REACT_APP_OPENWEATHER_API_KEY`

**Note**: The app works without this API key - it will use mock weather data for demonstration purposes.

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed
2. **API Connection Errors**: Verify backend and ML model servers are running
3. **Weather Data Not Loading**: Check your OpenWeather API key or use mock data

### Support

For issues and questions, please check the project documentation or create an issue in the repository.
