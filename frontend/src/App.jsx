import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import History from './pages/History';
import { getWeatherData, getSoilData } from './api/api';

function App() {
  const [lang, setLang] = useState('en');
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [globalPrediction, setGlobalPrediction] = useState(null);

  useEffect(() => {
    // Fetch initial data for the whole app context
    getWeatherData().then(setWeather).catch(console.error);
    getSoilData().then(setSoil).catch(console.error);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  lang={lang} 
                  setLang={setLang}
                  weather={weather} 
                  setWeather={setWeather}
                  soil={soil} 
                  setSoil={setSoil}
                  prediction={globalPrediction}
                  setPrediction={setGlobalPrediction}
                />
              } 
            />
            <Route 
              path="/insights" 
              element={<Insights prediction={globalPrediction} />} 
            />
            <Route 
              path="/history" 
              element={<History />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
