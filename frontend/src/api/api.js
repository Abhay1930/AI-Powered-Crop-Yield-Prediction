import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5001/api';

export const getYieldPrediction = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    throw error;
  }
};

export const getHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

export const getWeatherData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

export const getSoilData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/soil`);
    return response.data;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw error;
  }
};

export const getRealtimeWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather-live?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live weather:', error);
    throw error;
  }
};

export const getNDVIData = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ndvi?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NDVI data:', error);
    throw error;
  }
};

export const getNDVITimeline = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ndvi-timeline?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NDVI timeline:', error);
    throw error;
  }
};

export const getMandiData = async (crop = 'Rice') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/mandi?crop=${crop}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Mandi data:', error);
    throw error;
  }
};

export const sendChatMessage = async (message, language = 'en', context = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, { message, language, context });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getAIAdvisory = async (predictionData, farmData, language = 'en') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai-advisory`, { predictionData, farmData, language });
    return response.data;
  } catch (error) {
    console.error('Error getting AI advisory:', error);
    throw error;
  }
};
