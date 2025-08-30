import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FarmDataForm from './components/FarmDataForm';
import Dashboard from './pages/Dashboard';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Home from './pages/Home';
import './index.css';
import './i18n';

const App = () => {
  const [currentPrediction, setCurrentPrediction] = useState(null);

  const handlePrediction = async (formData) => {
    try {
      // Import the API function
      const { submitPrediction } = await import('./services/api');
      
      console.log('🚀 Making prediction from App component:', formData);
      const response = await submitPrediction(formData);
      
      if (response.data && response.data.success) {
        console.log('✅ Prediction successful:', response.data);
        setCurrentPrediction(response.data);
        
        // Navigate to dashboard to show the prediction
        window.location.href = '/dashboard';
      } else {
        console.error('❌ Prediction failed:', response.data);
        alert('Prediction failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error in prediction:', error);
      alert('Error making prediction. Please try again.');
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard initialPrediction={currentPrediction} />} />
        <Route path="/analytics" element={<AdvancedAnalytics />} />
        <Route path="/farm" element={<FarmDataForm onPredict={handlePrediction} />} />
      </Routes>
    </Router>
  );
};

export default App;
