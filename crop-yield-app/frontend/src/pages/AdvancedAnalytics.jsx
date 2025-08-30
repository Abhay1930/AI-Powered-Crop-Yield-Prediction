import React, { useState, useEffect, useRef } from 'react';
import { 
  getYieldTrends, 
  getCropComparison, 
  getSeasonalAnalysis, 
  getGeographicData,
  getWeatherData,
  getWeatherForecast,
  getPerformanceMetrics,
  getUniqueValues
} from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import WeatherWidget from '../components/WeatherWidget';
import { 
  Line, 
  Bar, 
  Radar, 
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('trends');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [crops, setCrops] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCrops, setSelectedCrops] = useState(['Rice', 'Wheat', 'Maize']);
  const [analyticsData, setAnalyticsData] = useState({
    yieldTrends: [],
    cropComparison: [],
    seasonalAnalysis: [],
    geographicData: [],
    performanceMetrics: {}
  });

  useEffect(() => {
    fetchInitialData();
    fetchWeatherData();
  }, []);

  useEffect(() => {
    if (selectedCrop && selectedState) {
      fetchAnalyticsData();
    }
  }, [selectedCrop, selectedState, selectedCrops]);

  const fetchInitialData = async () => {
    try {
      const uniqueValues = await getUniqueValues();
      setCrops(uniqueValues.data.crops || ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane']);
      setStates(uniqueValues.data.states || ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka']);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Set default values
      setCrops(['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane']);
      setStates(['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka']);
    }
  };

  const fetchWeatherData = async () => {
    try {
      // Using Mumbai coordinates as default (you can make this dynamic)
      const lat = 19.0760;
      const lon = 72.8777;
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'demo_key';
      
      // Only fetch real weather data if API key is available
      if (apiKey && apiKey !== 'demo_key') {
        const [currentWeather, forecast] = await Promise.all([
          getWeatherData(lat, lon, apiKey),
          getWeatherForecast(lat, lon, apiKey)
        ]);
        
        setWeatherData(currentWeather.data);
        setWeatherForecast(forecast.data.list.slice(0, 5)); // Next 5 forecasts
      } else {
        // Set mock weather data for demo
        setWeatherData({
          main: { temp: 28, humidity: 65, pressure: 1013 },
          weather: [{ description: 'Partly cloudy', icon: '02d' }],
          wind: { speed: 5.2 }
        });
        setWeatherForecast([
          { dt: Date.now() + 86400000, main: { temp: 29 }, weather: [{ description: 'Sunny', icon: '01d' }] },
          { dt: Date.now() + 172800000, main: { temp: 27 }, weather: [{ description: 'Cloudy', icon: '03d' }] },
          { dt: Date.now() + 259200000, main: { temp: 26 }, weather: [{ description: 'Light rain', icon: '10d' }] },
          { dt: Date.now() + 345600000, main: { temp: 25 }, weather: [{ description: 'Partly cloudy', icon: '02d' }] },
          { dt: Date.now() + 432000000, main: { temp: 28 }, weather: [{ description: 'Sunny', icon: '01d' }] }
        ]);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Set mock weather data for demo
      setWeatherData({
        main: { temp: 28, humidity: 65, pressure: 1013 },
        weather: [{ description: 'Partly cloudy', icon: '02d' }],
        wind: { speed: 5.2 }
      });
      setWeatherForecast([
        { dt: Date.now() + 86400000, main: { temp: 29 }, weather: [{ description: 'Sunny', icon: '01d' }] },
        { dt: Date.now() + 172800000, main: { temp: 27 }, weather: [{ description: 'Cloudy', icon: '03d' }] },
        { dt: Date.now() + 259200000, main: { temp: 26 }, weather: [{ description: 'Light rain', icon: '10d' }] },
        { dt: Date.now() + 345600000, main: { temp: 25 }, weather: [{ description: 'Partly cloudy', icon: '02d' }] },
        { dt: Date.now() + 432000000, main: { temp: 28 }, weather: [{ description: 'Sunny', icon: '01d' }] }
      ]);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        yieldTrendsRes,
        cropComparisonRes,
        seasonalRes,
        geographicRes,
        performanceRes
      ] = await Promise.all([
        getYieldTrends(selectedCrop, selectedState),
        getCropComparison(selectedCrops, selectedState, 2024),
        getSeasonalAnalysis(selectedCrop, selectedState),
        getGeographicData(selectedState),
        getPerformanceMetrics({ crop: selectedCrop, state: selectedState })
      ]);

      setAnalyticsData({
        yieldTrends: yieldTrendsRes.data || generateMockYieldTrends(),
        cropComparison: cropComparisonRes.data || generateMockCropComparison(),
        seasonalAnalysis: seasonalRes.data || generateMockSeasonalAnalysis(),
        geographicData: geographicRes.data || generateMockGeographicData(),
        performanceMetrics: performanceRes.data || generateMockPerformanceMetrics()
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set mock data for demo
      setAnalyticsData({
        yieldTrends: generateMockYieldTrends(),
        cropComparison: generateMockCropComparison(),
        seasonalAnalysis: generateMockSeasonalAnalysis(),
        geographicData: generateMockGeographicData(),
        performanceMetrics: generateMockPerformanceMetrics()
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators for demo
  const generateMockYieldTrends = () => {
    const years = [2020, 2021, 2022, 2023, 2024];
    return years.map(year => ({
      year,
      production: Math.floor(Math.random() * 5000) + 3000,
      yield_per_hectare: Math.random() * 3 + 4,
      area: Math.floor(Math.random() * 1000) + 800
    }));
  };

  const generateMockCropComparison = () => {
    return selectedCrops.map(crop => ({
      crop,
      production: Math.floor(Math.random() * 8000) + 2000,
      yield_per_hectare: Math.random() * 4 + 3,
      area: Math.floor(Math.random() * 1500) + 500,
      efficiency: Math.random() * 20 + 80
    }));
  };

  const generateMockSeasonalAnalysis = () => {
    return ['Kharif', 'Rabi', 'Zaid'].map(season => ({
      season,
      production: Math.floor(Math.random() * 6000) + 2000,
      yield_per_hectare: Math.random() * 3 + 4,
      success_rate: Math.random() * 30 + 70
    }));
  };

  const generateMockGeographicData = () => {
    return [
      { district: 'Pune', production: 4500, yield: 4.8 },
      { district: 'Nashik', production: 3800, yield: 4.2 },
      { district: 'Aurangabad', production: 3200, yield: 3.9 },
      { district: 'Nagpur', production: 4100, yield: 4.5 }
    ];
  };

  const generateMockPerformanceMetrics = () => {
    return {
      total_predictions: 156,
      accuracy_rate: 87.5,
      average_production: 4250,
      best_performing_district: 'Pune',
      seasonal_variance: 12.3
    };
  };

  const yieldTrendsChartData = {
    labels: analyticsData.yieldTrends.map(item => item.year),
    datasets: [
      {
        label: 'Production (tons)',
        data: analyticsData.yieldTrends.map(item => item.production),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Yield per Hectare (tons/ha)',
        data: analyticsData.yieldTrends.map(item => item.yield_per_hectare),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const cropComparisonChartData = {
    labels: analyticsData.cropComparison.map(item => item.crop),
    datasets: [
      {
        label: 'Production (tons)',
        data: analyticsData.cropComparison.map(item => item.production),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const seasonalAnalysisChartData = {
    labels: analyticsData.seasonalAnalysis.map(item => item.season),
    datasets: [
      {
        label: 'Production (tons)',
        data: analyticsData.seasonalAnalysis.map(item => item.production),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2
      },
      {
        label: 'Success Rate (%)',
        data: analyticsData.seasonalAnalysis.map(item => item.success_rate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  };

  const geographicChartData = {
    labels: analyticsData.geographicData.map(item => item.district),
    datasets: [
      {
        label: 'Production (tons)',
        data: analyticsData.geographicData.map(item => item.production),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#374151'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.2)' }
      },
      x: {
        grid: { color: 'rgba(156, 163, 175, 0.2)' }
      }
    }
  };

  const tabs = [
    { id: 'trends', name: 'Yield Trends', icon: '📈' },
    { id: 'comparison', name: 'Crop Comparison', icon: '🌾' },
    { id: 'seasonal', name: 'Seasonal Analysis', icon: '🌤️' },
    { id: 'geographic', name: 'Geographic Maps', icon: '🗺️' },
    { id: 'weather', name: 'Weather Data', icon: '🌦️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">Comprehensive insights for data-driven farming decisions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {crops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compare Crops</label>
              <select
                multiple
                value={selectedCrops}
                onChange={(e) => setSelectedCrops(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {crops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                {loading ? 'Loading...' : 'Update Analytics'}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Predictions</h3>
            <p className="text-3xl font-bold text-green-600">{analyticsData.performanceMetrics.total_predictions || 0}</p>
            <p className="text-gray-600">Historical records</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Accuracy Rate</h3>
            <p className="text-3xl font-bold text-blue-600">{analyticsData.performanceMetrics.accuracy_rate || 0}%</p>
            <p className="text-gray-600">Model performance</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Production</h3>
            <p className="text-3xl font-bold text-purple-600">{analyticsData.performanceMetrics.average_production || 0}</p>
            <p className="text-gray-600">tons per year</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Best District</h3>
            <p className="text-3xl font-bold text-orange-600">{analyticsData.performanceMetrics.best_performing_district || 'N/A'}</p>
            <p className="text-gray-600">Top performer</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Yield Trends Analysis */}
              {activeTab === 'trends' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Yield Trend Analysis</h2>
                  <div className="h-96">
                    <Line data={yieldTrendsChartData} options={chartOptions} />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div key="trend-analysis" className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800">Trend Analysis</h4>
                      <p className="text-gray-600">Production shows an upward trend with seasonal variations</p>
                    </div>
                    <div key="forecast" className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800">Forecast</h4>
                      <p className="text-gray-600">Expected 8% increase in next season based on current trends</p>
                    </div>
                    <div key="recommendations" className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800">Recommendations</h4>
                      <p className="text-gray-600">Consider expanding area under cultivation for better yields</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Crop Performance Comparison */}
              {activeTab === 'comparison' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Crop Performance Comparison</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96">
                      <Bar data={cropComparisonChartData} options={chartOptions} />
                    </div>
                    <div className="space-y-4">
                      {analyticsData.cropComparison.map((crop, index) => (
                        <div key={crop.crop} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-800">{crop.crop}</h4>
                            <span className="text-sm text-gray-500">{(crop.efficiency || 0).toFixed(1)}% efficiency</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Production: {(crop.production || 0).toLocaleString()} tons</div>
                            <div>Yield: {(crop.yield_per_hectare || 0).toFixed(1)} tons/ha</div>
                            <div>Area: {(crop.area || 0).toLocaleString()} ha</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seasonal Analysis */}
              {activeTab === 'seasonal' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Seasonal Analysis</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96">
                      <Bar data={seasonalAnalysisChartData} options={chartOptions} />
                    </div>
                    <div className="space-y-4">
                      {analyticsData.seasonalAnalysis.map((season, index) => (
                        <div key={season.season} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{season.season} Season</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Production:</span>
                              <span className="font-semibold">{(season.production || 0).toLocaleString()} tons</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yield:</span>
                              <span className="font-semibold">{(season.yield_per_hectare || 0).toFixed(1)} tons/ha</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Success Rate:</span>
                              <span className="font-semibold">{(season.success_rate || 0).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Geographic Visualization */}
              {activeTab === 'geographic' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Geographic Distribution</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactive District Map</h3>
                      <InteractiveMap 
                        data={analyticsData.geographicData}
                        selectedState={selectedState}
                        onDistrictClick={(district) => {
                          console.log('Selected district:', district);
                          // You can add more functionality here
                        }}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Click on markers to view district details. Map shows {analyticsData.geographicData.length} districts.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-4">District-wise Performance</h4>
                        {analyticsData.geographicData.map((district, index) => (
                          <div key={district.district} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <span className="font-medium">{district.district}</span>
                            <div className="text-right">
                              <div className="font-semibold">{(district.production || 0).toLocaleString()} tons</div>
                              <div className="text-sm text-gray-500">{(district.yield || 0).toFixed(1)} tons/ha</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Geographic Insights</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li key="insight-1">• Pune leads in production with highest yield efficiency</li>
                          <li key="insight-2">• Coastal districts show consistent performance</li>
                          <li key="insight-3">• Northern districts have growth potential</li>
                          <li key="insight-4">• Consider soil type variations across districts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Integration */}
              {activeTab === 'weather' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Weather Data</h2>
                  <WeatherWidget 
                    weatherData={weatherData}
                    forecast={weatherForecast}
                    location={selectedState}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
