import { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, AlertTriangle, Mic, Activity, MapPin, Loader2, TrendingUp, Info, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getYieldPrediction, getRealtimeWeather } from '../api/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { useLanguage } from '../context/LanguageContext';

function Dashboard({ weather, setWeather, soil, setSoil, prediction, setPrediction }) {
  const { t, lang } = useLanguage();
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [formData, setFormData] = useState({
    crop_type: 'wheat',
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    soil_ph: 6.5,
    soil_n: 40,
    soil_p: 30,
    soil_k: 30,
    fertilizer: 100,
    pesticide: 50,
    state: 'Assam'
  });

  useEffect(() => {
    if (weather) {
      setFormData(prev => ({ ...prev, temperature: weather.temperature, humidity: weather.humidity, rainfall: weather.rainfall }));
    }
  }, [weather]);

  useEffect(() => {
    if (soil) {
      setFormData(prev => ({ ...prev, soil_ph: soil.ph, soil_n: soil.nitrogen }));
    }
  }, [soil]);

  const handlePredict = async (e) => {
    e?.preventDefault();
    setIsPredicting(true);
    try {
      const res = await getYieldPrediction(formData);
      setPrediction(res);
    } catch (err) {
      alert("Prediction failed. Ensure services are online.");
    } finally {
      setIsPredicting(false);
    }
  };

  const chartData = {
    labels: ['Regional Avg', 'Your Prediction'],
    datasets: [
      {
        label: 'Yield (kg/ha)',
        data: [3200, prediction?.yield || 0],
        backgroundColor: ['rgba(156, 163, 175, 0.2)', 'rgba(34, 197, 94, 0.2)'],
        borderColor: ['#9ca3af', '#16a34a'],
        borderWidth: 2,
        pointBackgroundColor: '#16a34a',
        tension: 0.4
      },
    ],
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 px-4 py-2"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card */}
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ThermometerSun className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ThermometerSun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">{t.dashboard.weather}</h3>
          </div>
          {weather ? (
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Temperature</p>
                    <p className="text-xl font-bold text-gray-700">{weather.temperature?.toFixed(1)}°C</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Humidity</p>
                    <p className="text-xl font-bold text-gray-700">{weather.humidity?.toFixed(1)}%</p>
                </div>
             </div>
          ) : <div className="animate-pulse h-10 bg-gray-50 rounded"></div>}
        </motion.div>

        {/* Soil Card */}
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-amber-500" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">{t.dashboard.soil}</h3>
          </div>
          {soil ? (
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">pH Level</p>
                    <p className="text-xl font-bold text-gray-700">{soil.ph?.toFixed(1)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nitrogen</p>
                    <p className="text-xl font-bold text-gray-700">{soil.nitrogen?.toFixed(0)}</p>
                </div>
             </div>
          ) : (
            <div className="space-y-2">
                <div className="h-4 bg-gray-50 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-50 rounded animate-pulse w-1/2"></div>
            </div>
          )}
        </motion.div>

        {/* AI Insight Badge (Modern Card) */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold">AI Status</h3>
          </div>
          {prediction ? (
             <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${prediction.confidence > 0.8 ? 'bg-green-400' : 'bg-yellow-400'} text-green-900`}>
                        {prediction.confidence > 0.8 ? 'High Confidence' : 'Moderate'}
                    </span>
                </div>
                <p className="text-sm opacity-90">Model relies 84% on crop type accuracy for this estimate.</p>
             </div>
          ) : (
            <p className="text-sm italic opacity-70">Awaiting inputs for analysis...</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
                <Info className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">{t.dashboard.params}</h2>
            </div>
            <form onSubmit={handlePredict} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Crop Variety</label>
                    <select 
                        value={formData.crop_type}
                        onChange={e => setFormData({...formData, crop_type: e.target.value})}
                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500"
                    >
                        <option value="wheat">Wheat</option>
                        <option value="rice">Rice</option>
                        <option value="corn">Maize</option>
                        <option value="cotton">Cotton</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fertilizer (kg)</label>
                    <input 
                        type="number" 
                        value={formData.fertilizer}
                        onChange={e => setFormData({...formData, fertilizer: e.target.value})}
                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <button 
                    disabled={isPredicting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                    {isPredicting ? t.dashboard.analyzing : t.dashboard.predictBtn}
                </button>
            </form>
        </div>

        {/* Results & Smart Advisory */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
        >
            {prediction ? (
                <>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h4 className="text-gray-400 font-medium mb-1">Total Estimated Yield</h4>
                        <div className="text-5xl font-black text-green-600">
                            {prediction.yield.toLocaleString()} <span className="text-lg font-normal text-gray-400">kg/ha</span>
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-32">
                        <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: false } } }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 text-blue-700 mb-1">
                            <Droplets className="w-4 h-4" />
                            <span className="font-bold text-xs uppercase">Irrigation</span>
                        </div>
                        <p className="text-xs text-blue-900 leading-tight">{prediction.advisory.irrigation}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-2 text-green-700 mb-1">
                            <Leaf className="w-4 h-4" />
                            <span className="font-bold text-xs uppercase">Fertilizer</span>
                        </div>
                        <p className="text-xs text-green-900 leading-tight">{prediction.advisory.fertilizer}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div className="flex items-center space-x-2 text-red-700 mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-bold text-xs uppercase">Pest Risk</span>
                        </div>
                        <p className="text-xs text-red-900 leading-tight">{prediction.advisory.pest_risk}</p>
                    </div>
                </div>
                </>
            ) : (
                <div className="bg-white p-20 rounded-2xl shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                    <p>Enter data and run AI analysis to see results.</p>
                </div>
            )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
