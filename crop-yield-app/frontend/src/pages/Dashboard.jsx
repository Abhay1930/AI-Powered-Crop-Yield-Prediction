import React, { useState, useEffect, useRef } from 'react';
import { submitPrediction, getHistoricalData } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PredictionCard from '../components/PredictionCard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = ({ initialPrediction }) => {
  const [prediction, setPrediction] = useState(initialPrediction);
  const [historical, setHistorical] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchHistorical();
  }, []);

  // Set initial prediction if provided
  useEffect(() => {
    if (initialPrediction) {
      setPrediction(initialPrediction);
      console.log('✅ Initial prediction set:', initialPrediction);
    }
  }, [initialPrediction]);

  // Debug: Log when historical data changes
  useEffect(() => {
    console.log('📈 Historical data updated:', historical);
  }, [historical]);

  const fetchHistorical = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching historical data...');
      const res = await getHistoricalData();
      console.log('📊 Historical data received:', res.data);
      
      if (res.data && Array.isArray(res.data)) {
        setHistorical(res.data);
        console.log('✅ Historical data set successfully:', res.data);
      } else {
        console.warn('⚠️ Historical data is not an array:', res.data);
        setHistorical([]);
      }
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set sample data for demo purposes
      setHistorical([
        { year: '2020', predicted_production: 4520, yield_per_hectare: 4.5 },
        { year: '2021', predicted_production: 4870, yield_per_hectare: 4.8 },
        { year: '2022', predicted_production: 5210, yield_per_hectare: 5.2 },
        { year: '2023', predicted_production: 4980, yield_per_hectare: 4.9 },
        { year: '2024', predicted_production: 5530, yield_per_hectare: 5.5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (formData) => {
    try {
      setLoading(true);
      console.log('🚀 Submitting prediction:', formData);
      const res = await submitPrediction(formData);
      console.log('✅ Prediction response:', res.data);
      
      if (res.data && res.data.success) {
        setPrediction(res.data);
        console.log('✅ Prediction set successfully:', res.data);
        
        // Refresh historical data after successful prediction
        console.log('🔄 Refreshing historical data after prediction...');
        await fetchHistorical();
        
        // Show success message
        alert('Prediction successful! Dashboard updated with new data.');
      } else {
        console.error('❌ Prediction response not successful:', res.data);
        alert('Prediction failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error making prediction:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Set sample prediction for demo
      setPrediction({
        success: true,
        prediction: {
          predicted_production: 5280,
          yield_per_hectare: 5.2,
          area_hectares: 1000,
          unit: "tons"
        },
        inputs: {
          state: "Maharashtra",
          district: "Pune",
          season: "Kharif",
          crop: "Rice",
          year: 2024,
          area: 1000
        },
        insights: {
          production_analysis: "Good production potential with 5,280 tons expected.",
          yield_analysis: "Average yield expected: 5.2 tons/hectare.",
          recommendations: [
            "Consider crop rotation to maintain soil health",
            "Monitor weather conditions for Kharif season",
            "Follow recommended planting dates for optimal yield"
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: historical.map(h => h.year || 'Unknown'),
    datasets: [
      {
        label: 'Production (tons)',
        data: historical.map(h => h.predicted_production || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y'
      },
      {
        label: 'Yield per Hectare (tons/ha)',
        data: historical.map(h => h.yield_per_hectare || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#374151'
        }
      },
      title: {
        display: true,
        text: 'Crop Production Trends Over Years',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#111827'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Production (tons)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Yield (tons/ha)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Crop Production Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor and analyze your agricultural predictions</p>
            </div>
            <button
              onClick={fetchHistorical}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {prediction && (
          <div className="mb-8">
            <PredictionCard prediction={prediction} />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="h-96">
            {historical.length > 0 ? (
              <Line 
                key={historical.length} 
                data={chartData} 
                options={chartOptions} 
                ref={chartRef} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">No historical data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Total Predictions</h3>
            <p className="text-3xl font-bold text-green-600">{historical.length}</p>
            <p className="text-gray-600">Historical records</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Average Production</h3>
            <p className="text-3xl font-bold text-blue-600">
              {historical.length > 0 
                ? (historical.reduce((sum, h) => sum + (h.predicted_production || 0), 0) / historical.length).toFixed(0)
                : '0'
              }
            </p>
            <p className="text-gray-600">tons per year</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Latest Production</h3>
            <p className="text-3xl font-bold text-purple-600">
              {prediction?.prediction?.predicted_production ? 
                prediction.prediction.predicted_production.toFixed(0) : 'N/A'
              }
            </p>
            <p className="text-gray-600">Current forecast</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
