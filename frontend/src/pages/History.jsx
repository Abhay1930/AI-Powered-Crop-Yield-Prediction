import { useState, useEffect } from 'react';
import { getHistory } from '../api/api';
import { Search, Calendar, Filter, ChevronRight, BarChart3, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(data => {
      setHistory(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Prediction History</h2>
            <p className="text-sm text-gray-500">Track and analyze your past AI estimates</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search crops..." className="pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <button className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                <Filter className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="p-20 flex flex-col items-center justify-center text-gray-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
               <p>Fetching historical data...</p>
           </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Crop</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Yield (kg/ha)</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {history.map((item, idx) => (
                    <motion.tr 
                      key={item._id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs uppercase">
                                  {item.crop_type.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-700 capitalize">{item.crop_type}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{item.state}</td>
                      <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">{item.yield.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              item.confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                              {(item.confidence * 100).toFixed(0)}% Match
                          </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs text-nowrap">
                          {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-300 group-hover:text-green-600 transition">
                              <ChevronRight className="w-5 h-5" />
                          </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 text-center flex flex-col items-center justify-center text-gray-400"
          >
              <Database className="w-16 h-16 mb-4 opacity-10" />
              <h3 className="text-lg font-medium">No history found</h3>
              <p className="text-sm">Run your first AI prediction on the dashboard to start tracking data.</p>
          </motion.div>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-gray-400 font-medium">Avg Prediction Yield</p>
                   <p className="text-2xl font-black text-gray-800">
                        {history.length > 0 ? (history.reduce((a, b) => a + b.yield, 0) / history.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'}
                   </p>
                </div>
            </div>
        </motion.div>
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-gray-400 font-medium">Total Samples</p>
                   <p className="text-2xl font-black text-gray-800">{history.length}</p>
                </div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default History;
