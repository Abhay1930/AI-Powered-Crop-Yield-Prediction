import { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, AlertTriangle, Mic, Activity, MapPin, Loader2, TrendingUp, Info, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getYieldPrediction, getRealtimeWeather, getMandiData, getAIAdvisory } from '../api/api';
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

import { STATE_COORDS, CROP_TYPES } from '../utils/constants';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';

function Dashboard({ weather, setWeather, soil, setSoil, prediction, setPrediction, fetchWeather }) {
  const { t, lang } = useLanguage();
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [formData, setFormData] = useState({
    crop_type: 'rice',
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    soil_ph: 6.5,
    soil_n: 40,
    soil_p: 30,
    soil_k: 30,
    fertilizer: 100,
    pesticide: 50,
    state: 'Odisha'
  });

  useEffect(() => {
    if (weather) {
      setFormData(prev => ({ 
        ...prev, 
        temperature: weather.temperature || prev.temperature, 
        humidity: weather.humidity || prev.humidity, 
        rainfall: weather.rainfall || prev.rainfall 
      }));
    }
  }, [weather]);

  useEffect(() => {
    if (soil) {
      setFormData(prev => ({ ...prev, soil_ph: soil.ph, soil_n: soil.nitrogen }));
    }
  }, [soil]);

  useEffect(() => {
    const coords = STATE_COORDS[formData.state];
    if (coords && fetchWeather) {
      fetchWeather(coords.lat, coords.lon, formData.state);
    }
  }, [formData.state]);

  const [mandiData, setMandiData] = useState(null);
  useEffect(() => {
    const cropLabel = CROP_TYPES.find(c => c.id === formData.crop_type)?.label || 'Rice';
    getMandiData(cropLabel).then(setMandiData).catch(console.error);
  }, [formData.crop_type]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Detected Location');
      });
    }
  };

  const [aiNarrative, setAiNarrative] = useState(null);
  const [isNarrating, setIsNarrating] = useState(false);

  const handlePredict = async (e) => {
    e?.preventDefault();
    setIsPredicting(true);
    setAiNarrative(null);
    try {
      const res = await getYieldPrediction(formData);
      setPrediction(res);
      // Auto-trigger Gemini narrative
      setIsNarrating(true);
      getAIAdvisory(res, formData, lang)
        .then(data => setAiNarrative(data.narrative))
        .catch(console.error)
        .finally(() => setIsNarrating(false));
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
      {/* Govt of Odisha Badge */}
      <div className="flex items-center space-x-2 bg-green-50 w-fit px-4 py-1.5 rounded-full border border-green-100 mb-2">
        <Sparkles className="w-3 h-3 text-green-600" />
        <span className="text-[10px] font-black uppercase tracking-wider text-green-700">Govt of Odisha Partnership - KrishiAI GEO</span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {/* Weather Card */}
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ThermometerSun className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ThermometerSun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 tracking-tight">{t.dashboard.weather}</h3>
            </div>
            <button 
              onClick={handleMyLocation}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors group/loc"
              title="Use My Location"
            >
              <MapPin className="w-4 h-4 text-gray-400 group-hover/loc:text-blue-500" />
            </button>
          </div>
          
          {weather ? (
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{weather.locationName || formData.state}</span>
                 </div>
                 <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-black">LIVE</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Temp</p>
                      <p className="text-xl font-black text-gray-700">{weather.temperature?.toFixed(1)}°C</p>
                  </div>
                  <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Hum</p>
                      <p className="text-xl font-black text-gray-700">{weather.humidity?.toFixed(1)}%</p>
                  </div>
               </div>
             </div>
          ) : (
            <div className="space-y-4">
               <Skeleton className="h-3 w-2/3" />
               <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
               </div>
            </div>
          )}
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
            <h3 className="font-bold text-gray-800 tracking-tight">{t.dashboard.soil}</h3>
          </div>
          {soil ? (
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">pH</p>
                    <p className="text-xl font-black text-gray-700">{soil.ph?.toFixed(1)}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">N</p>
                    <p className="text-xl font-black text-gray-700">{soil.nitrogen?.toFixed(0)}</p>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
            </div>
          )}
        </motion.div>

        {/* Market Intel Card (NEW SIH FEATURE) */}
        <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => window.location.href = '/satellite-monitoring'}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800 tracking-tight">{lang === 'or' ? 'ବଜାର ସୂଚନା' : 'Market Intel'}</h3>
          </div>
          {mandiData ? (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                Mandi Price · {mandiData.crop}
              </p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black text-emerald-600">
                  ₹{mandiData.avgPrice?.toLocaleString()} 
                  <span className="text-[10px] text-gray-400 font-normal ml-1">/Qtl</span>
                </p>
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${mandiData.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {mandiData.priceChange}
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-1 truncate">📍 {mandiData.topMandis?.join(', ')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          )}
        </motion.div>

        {/* Satellite Quick-Stats (NEW SIH FEATURE) */}
        <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => window.location.href = '/satellite-monitoring'}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800 tracking-tight">{lang === 'or' ? 'ସାଟେଲାଇଟ୍ ସ୍ଥିତି' : 'Satellite Hub'}</h3>
          </div>
          <div className="space-y-1">
             <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-gray-400 uppercase">NDVI</span>
                <span className="text-indigo-600">0.72</span>
             </div>
             <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[72%]"></div>
             </div>
          </div>
        </motion.div>

        {/* AI Insight Badge (Modern Card) */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight">AI Status</h3>
          </div>
          {prediction ? (
             <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${prediction.confidence > 0.8 ? 'bg-green-400' : 'bg-yellow-400'} text-green-900`}>
                        {prediction.confidence > 0.8 ? 'Excellent' : 'Stable'}
                    </span>
                </div>
                <p className="text-[10px] font-medium opacity-90">Precision yield analysis active.</p>
             </div>
          ) : (
            <p className="text-sm italic opacity-70 leading-tight">Sensing local regional data...</p>
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
                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
                    >
                        {CROP_TYPES.map(crop => (
                            <option key={crop.id} value={crop.id}>{crop.icon} {crop.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center justify-between">
                            Temp (°C)
                            <span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded-full font-black animate-pulse">SENSOR</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={formData.temperature}
                            onChange={e => setFormData({...formData, temperature: e.target.value})}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center justify-between">
                            Hum (%)
                            <span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded-full font-black animate-pulse">SENSOR</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={formData.humidity}
                            onChange={e => setFormData({...formData, humidity: e.target.value})}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center justify-between">
                            Soil pH
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1 rounded-full font-black">MOCKED</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={formData.soil_ph}
                            onChange={e => setFormData({...formData, soil_ph: e.target.value})}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">State / Region</label>
                        <select 
                            value={formData.state}
                            onChange={e => setFormData({...formData, state: e.target.value})}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
                        >
                            {Object.keys(STATE_COORDS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fertilizer (kg)</label>
                    <input 
                        type="number" 
                        value={formData.fertilizer}
                        onChange={e => setFormData({...formData, fertilizer: e.target.value})}
                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-green-500 font-bold"
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

                {/* Gemini AI Narrative */}
                <AnimatePresence>
                  {(isNarrating || aiNarrative) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border overflow-hidden shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderColor: '#334155' }}
                    >
                      <div className="flex items-center space-x-2 px-6 py-4 border-b border-white/5" style={{ background: 'rgba(34,197,94,0.1)' }}>
                        <div className="p-2 bg-green-500/20 rounded-lg">
                           <Sparkles className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                           <span className="text-green-400 text-xs font-black uppercase tracking-widest block leading-none">AI Insight</span>
                           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Powered by Gemini 2.0 Flash</span>
                        </div>
                        <span className="ml-auto flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[10px] text-green-500 font-black uppercase">Live Analysis</span>
                        </span>
                      </div>
                      <div className="px-6 py-5">
                        {isNarrating ? (
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-3">
                              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                              <span className="text-gray-400 text-sm font-medium">Processing agronomic patterns & climate data...</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div 
                                   initial={{ x: '-100%' }}
                                   animate={{ x: '100%' }}
                                   transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                   className="h-full w-1/3 bg-green-500"
                                />
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">{aiNarrative}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative group overflow-hidden">
                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Droplets className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-2 text-blue-700 mb-1 relative">
                            <Droplets className="w-4 h-4" />
                            <span className="font-bold text-[10px] uppercase tracking-widest text-blue-800">Irrigation Plan</span>
                        </div>
                        <p className="text-xs text-blue-900 leading-tight font-medium relative">{prediction.advisory.irrigation}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 relative group overflow-hidden">
                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Leaf className="w-12 h-12 text-green-600" />
                        </div>
                        <div className="flex items-center space-x-2 text-green-700 mb-1 relative">
                            <Leaf className="w-4 h-4" />
                            <span className="font-bold text-[10px] uppercase tracking-widest text-green-800">Nutrient Mix</span>
                        </div>
                        <p className="text-xs text-green-900 leading-tight font-medium relative">{prediction.advisory.fertilizer}</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 relative group overflow-hidden">
                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        </div>
                        <div className="flex items-center space-x-2 text-red-700 mb-1 relative">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-bold text-[10px] uppercase tracking-widest text-red-800">Risk Assessment</span>
                        </div>
                        <p className="text-xs text-red-900 leading-tight font-medium relative">
                            {prediction.advisory.pest_risk || (weather?.humidity > 80 ? "Critical: High fungal risk due to moisture." : "Nominal: No immediate pest alerts.") }
                        </p>
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
