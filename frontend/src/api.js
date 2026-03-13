import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const getYieldPrediction = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
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
