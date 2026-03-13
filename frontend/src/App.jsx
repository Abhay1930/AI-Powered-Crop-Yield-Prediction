import { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, AlertTriangle, Languages, Mic, Activity } from 'lucide-react';
import { getYieldPrediction, getWeatherData, getSoilData } from './api';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const translations = {
  en: {
    title: 'KrishiAI Dashboard',
    cropLabel: 'Crop Type',
    predictBtn: 'Predict Yield',
    yieldEst: 'Estimated Yield',
    weather: 'Weather Context',
    soil: 'Soil Health',
    advisory: 'Smart Advisory',
  },
  hi: {
    title: 'कृषिAI डैशबोर्ड (KrishiAI Dashboard)',
    cropLabel: 'फसल का प्रकार (Crop Type)',
    predictBtn: 'उपज का अनुमान लगाएं (Predict Yield)',
    yieldEst: 'अनुमानित उपज (Estimated Yield)',
    weather: 'मौसम (Weather)',
    soil: 'मिट्टी का स्वास्थ्य (Soil Health)',
    advisory: 'स्मार्ट सलाह (Smart Advisory)',
  },
  od: {
    title: 'କୃଷିAI ଡ୍ୟାସବୋର୍ଡ (KrishiAI Dashboard)',
    cropLabel: 'ଫସଲ ପ୍ରକାର (Crop Type)',
    predictBtn: 'ଅମଳ ପୂର୍ବାନୁମାନ (Predict Yield)',
    yieldEst: 'ପୂର୍ବାନୁମାନିତ ଅମଳ (Estimated Yield)',
    weather: 'ପାଣିପାଗ (Weather)',
    soil: 'ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ (Soil Health)',
    advisory: 'ସ୍ମାର୍ଟ ପରାମର୍ଶ (Smart Advisory)'
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  
  const [formData, setFormData] = useState({
    crop_type: 'wheat',
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    ph: 6.5,
    nitrogen: 40,
    moisture: 45,
    fertilizer_usage: 100
  });

  const [prediction, setPrediction] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    // Fetch initial mock data
    getWeatherData().then(w => {
      setWeather(w);
      setFormData(prev => ({ ...prev, temperature: w.temperature, humidity: w.humidity, rainfall: w.rainfall }));
    }).catch(console.error);

    getSoilData().then(s => {
      setSoil(s);
      setFormData(prev => ({ ...prev, ph: s.ph, nitrogen: s.nitrogen, moisture: s.moisture }));
    }).catch(console.error);
  }, []);

  const handlePredict = async (e) => {
    e?.preventDefault();
    try {
      const res = await getYieldPrediction(formData);
      setPrediction(res);
    } catch (err) {
      alert("Error fetching prediction. Make sure backend and ML services are running.");
    }
  };

  const handleVoiceInput = () => {
    // Basic Web Speech API usage
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice input.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : lang === 'hi' ? 'hi-IN' : 'or-IN';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // Basic heuristic: find crop name in transcript
      const crops = ['wheat', 'rice', 'corn', 'cotton', 'sugarcane'];
      for (const c of crops) {
        if (transcript.includes(c)) {
          setFormData(prev => ({ ...prev, crop_type: c }));
          alert(`Detected crop: ${c}`);
          break;
        }
      }
    };
    
    recognition.start();
  };

  const chartData = {
    labels: ['Expected Avg', 'Predicted Yield'],
    datasets: [
      {
        label: 'Yield (kg/hectare)',
        data: [
          formData.crop_type === 'wheat' ? 3000 : formData.crop_type === 'rice' ? 4000 : 3500, 
          prediction?.yield_prediction || 0
        ],
        backgroundColor: ['rgba(156, 163, 175, 0.5)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['#9ca3af', '#22c55e'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-krishi-50 font-sans">
      {/* Navbar */}
      <nav className="bg-krishi-700 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Leaf className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">KrishiAI</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : lang === 'hi' ? 'od' : 'en')} className="flex items-center space-x-1 hover:text-krishi-100 transition">
            <Languages className="w-5 h-5" />
            <span className="uppercase font-semibold">{lang}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-krishi-100">
            <div className="flex items-center space-x-2 text-krishi-700 mb-4">
              <ThermometerSun className="w-6 h-6" />
              <h2 className="text-xl font-semibold">{t.weather}</h2>
            </div>
            {weather ? (
              <div className="space-y-2 text-gray-700">
                <p>Temp: <span className="font-bold">{weather.temperature.toFixed(1)}°C</span></p>
                <p>Humidity: <span className="font-bold">{weather.humidity.toFixed(1)}%</span></p>
                <p>Rainfall: <span className="font-bold">{weather.rainfall.toFixed(1)}mm</span></p>
              </div>
            ) : <p className="animate-pulse text-gray-400">Loading...</p>}
          </div>

          {/* Soil Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-krishi-100">
            <div className="flex items-center space-x-2 text-krishi-700 mb-4">
              <Activity className="w-6 h-6" />
              <h2 className="text-xl font-semibold">{t.soil}</h2>
            </div>
            {soil ? (
              <div className="space-y-2 text-gray-700">
                <p>pH Level: <span className="font-bold">{soil.ph.toFixed(1)}</span></p>
                <p>Nitrogen: <span className="font-bold">{soil.nitrogen.toFixed(1)} mg/kg</span></p>
                <p>Moisture: <span className="font-bold">{soil.moisture.toFixed(1)}%</span></p>
              </div>
            ) : <p className="animate-pulse text-gray-400">Loading...</p>}
          </div>

          {/* Advisory Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-krishi-100">
            <div className="flex items-center space-x-2 text-amber-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-semibold text-gray-800">{t.advisory}</h2>
            </div>
            {prediction ? (
              <div className="space-y-3 text-sm">
                <p className="flex items-start"><Droplets className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0"/> {prediction.advisory.irrigation}</p>
                <p className="flex items-start"><Leaf className="w-4 h-4 mr-2 mt-0.5 text-krishi-500 flex-shrink-0"/> {prediction.advisory.fertilizer}</p>
                <p className="flex items-start"><AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0"/> {prediction.advisory.pest_risk}</p>
              </div>
            ) : <p className="text-gray-400 italic">Predict yield to see advisory.</p>}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Prediction Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-krishi-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h2>
            
            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.cropLabel}</label>
                <div className="flex space-x-2">
                  <select 
                    value={formData.crop_type} 
                    onChange={e => setFormData({...formData, crop_type: e.target.value})}
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-krishi-500 focus:ring-krishi-500 p-2 border"
                  >
                    <option value="wheat">Wheat / गेहूं</option>
                    <option value="rice">Rice / चावल</option>
                    <option value="corn">Corn / मक्का</option>
                    <option value="cotton">Cotton / कपास</option>
                    <option value="sugarcane">Sugarcane / गन्ना</option>
                  </select>
                  <button 
                    type="button" 
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-lg border ${isListening ? 'bg-red-100 border-red-300 text-red-600 animate-pulse' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                    title="Voice input for crop"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Used (kg/ha)</label>
                <input 
                  type="number" 
                  value={formData.fertilizer_usage}
                  onChange={e => setFormData({...formData, fertilizer_usage: parseFloat(e.target.value)})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-krishi-500 focus:ring-krishi-500 p-2 border"
                />
              </div>

              {/* Advanced Inputs Toggle could go here, but omitted for brevity. Inputs map to weather/soil state by default */}

              <button 
                type="submit"
                className="w-full bg-krishi-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-krishi-700 transition"
              >
                {t.predictBtn}
              </button>
            </form>
          </div>

          {/* Prediction Results & Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-krishi-100 flex flex-col justify-center items-center">
            {prediction ? (
              <div className="w-full text-center fade-in">
                <h3 className="text-xl font-medium text-gray-500 mb-2">{t.yieldEst}</h3>
                <div className="text-5xl font-extrabold text-krishi-600 mb-8">
                  {prediction.yield_prediction.toLocaleString()} <span className="text-2xl text-gray-500 font-normal">kg/ha</span>
                </div>
                
                <div className="w-full h-64 flex justify-center">
                  <Line 
                    data={chartData} 
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select parameters and predict yield to visualize data.</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;
