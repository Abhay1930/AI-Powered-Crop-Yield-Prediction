import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { getRealtimeWeather } from './api/api';

const AppContent = () => {
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initial data fetch
    getRealtimeWeather(28.6139, 77.2090).then(setWeather).catch(console.error);
    // Mock soil
    setSoil({ ph: 6.5, nitrogen: 45, moisture: 30 });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-green-600 font-bold tracking-widest uppercase">KrishiAI Loading...</p>
        </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard weather={weather} setWeather={setWeather} soil={soil} setSoil={setSoil} prediction={prediction} setPrediction={setPrediction} />} />
            <Route path="/insights" element={<Insights prediction={prediction} />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
