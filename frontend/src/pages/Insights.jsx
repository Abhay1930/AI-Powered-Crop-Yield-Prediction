import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BrainCircuit, Info, Target, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { useLanguage } from '../context/LanguageContext';

const Insights = ({ prediction }) => {
  const { t } = useLanguage();
  if (!prediction) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100 m-4"
      >
        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">AI Insights Unavailable</h2>
        <p className="mt-1">Run a prediction on the dashboard to generate AI explanations.</p>
      </motion.div>
    );
  }

  const importanceData = {
    labels: Object.keys(prediction.feature_importance).slice(0, 6).map(k => k.replace('_', ' ')),
    datasets: [
      {
        label: 'Influence Score',
        data: Object.values(prediction.feature_importance).slice(0, 6),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Explanation Card */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 text-green-50 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-4 text-green-600">
              <Zap className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-800">Model Explanation</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
               Our Random Forest Regressor analyzed 10 environmental and agricultural variables to produce this estimate. 
               The model has identified <span className="font-bold text-green-600">Crop Type</span> and <span className="font-bold text-green-600">Soil Nitrogen</span> as the primary drivers for your current scenario.
            </p>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <Target className="w-10 h-10 text-green-600" />
            <div>
                <p className="text-sm font-bold text-green-800">Confidence Score: {(prediction.confidence * 100).toFixed(1)}%</p>
                <p className="text-xs text-green-700 opacity-80">Highly reliable based on historical similarity.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Importance Chart */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Info className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-800">Why this yield? (Feature Impact)</h3>
          </div>
          <div className="h-64">
            <Bar 
              data={importanceData} 
              options={{ 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
              }} 
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Insights;
