import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"; // Node.js backend URL
const ML_API_URL = process.env.REACT_APP_ML_API_URL || "http://localhost:8000"; // ML model API URL
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5"; // Weather API

// ML Model endpoints (for getting unique values)
export const getUniqueValues = () => axios.get(`${ML_API_URL}/unique-values`);
export const getDistrictsForState = (state) => axios.get(`${ML_API_URL}/districts/${encodeURIComponent(state)}`);
export const getMLHealth = () => axios.get(`${ML_API_URL}/health`);

// Backend endpoints (for predictions and historical data)
export const submitPrediction = (data) => axios.post(`${BASE_URL}/prediction`, data);
export const getHistoricalData = () => axios.get(`${BASE_URL}/historical`);

// Advanced Analytics endpoints
export const getYieldTrends = (crop, state, years = 5) => 
  axios.get(`${BASE_URL}/analytics/yield-trends?crop=${crop}&state=${state}&years=${years}`);

export const getCropComparison = (crops, state, year) => 
  axios.post(`${BASE_URL}/analytics/crop-comparison`, { crops, state, year });

export const getSeasonalAnalysis = (crop, state, seasons = ['Kharif', 'Rabi', 'Zaid']) => 
  axios.get(`${BASE_URL}/analytics/seasonal?crop=${crop}&state=${state}&seasons=${seasons.join(',')}`);

export const getGeographicData = (state) => 
  axios.get(`${BASE_URL}/analytics/geographic?state=${state}`);

export const getWeatherData = (lat, lon, apiKey) => 
  axios.get(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

export const getWeatherForecast = (lat, lon, apiKey) => 
  axios.get(`${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

export const getPredictionInsights = (predictionId) => 
  axios.get(`${BASE_URL}/analytics/insights/${predictionId}`);

export const getPerformanceMetrics = (filters = {}) => 
  axios.post(`${BASE_URL}/analytics/performance`, filters);

// Legacy endpoints (for backward compatibility)
export const submitFarmData = (data) => axios.post(`${BASE_URL}/prediction`, data);
