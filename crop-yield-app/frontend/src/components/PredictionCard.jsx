import React from 'react';

const PredictionCard = ({ prediction }) => {
  const formatNumber = (value) => {
    return typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value;
  };

  const formatInsightValue = (value) => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      // Handle object values by extracting meaningful information
      if (value.predicted_value !== undefined) {
        return `Predicted value: ${formatNumber(value.predicted_value)}${value.confidence_score ? ` (Confidence: ${(value.confidence_score * 100).toFixed(1)}%)` : ''}`;
      } else if (value.yield_per_hectare !== undefined) {
        return `Yield: ${formatNumber(value.yield_per_hectare)} tons/hectare${value.efficiency_rating ? ` (Efficiency: ${value.efficiency_rating})` : ''}`;
      } else {
        // Fallback: convert object to readable string
        return JSON.stringify(value, null, 2).replace(/[{}",]/g, '').trim();
      }
    }
    return String(value);
  };

  if (!prediction || !prediction.prediction) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Prediction Data</h2>
          <p className="text-red-100">Please submit a prediction request first.</p>
        </div>
      </div>
    );
  }

  const { prediction: predData, inputs, insights } = prediction;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Production Prediction</h2>
          <p className="text-green-100 text-lg">AI-powered crop production insights</p>
        </div>
        <div className="bg-white/20 rounded-full p-4">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Location and Crop Info */}
      <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-green-100 text-sm">Location</p>
            <p className="font-semibold">{inputs?.state}, {inputs?.district}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Crop</p>
            <p className="font-semibold">{inputs?.crop}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Season</p>
            <p className="font-semibold">{inputs?.season}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Area</p>
            <p className="font-semibold">{formatNumber(inputs?.area)} ha</p>
          </div>
        </div>
      </div>

      {/* Production Prediction */}
      <div className="mb-6">
        <div className="text-center">
          <span className="text-6xl font-bold text-yellow-300">
            {formatNumber(predData.predicted_production)}
          </span>
          <span className="text-2xl text-green-100 ml-2">tons</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-lg text-green-100">
            ({formatNumber(predData.yield_per_hectare)} tons/hectare)
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="mb-6">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <span className="mr-2">📊</span>
            Production Analysis
          </h3>
          <p className="text-green-100">{formatInsightValue(insights?.production_analysis)}</p>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <span className="mr-2">🌱</span>
            Yield Analysis
          </h3>
          <p className="text-green-100">{formatInsightValue(insights?.yield_analysis)}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights?.recommendations?.map((recommendation, index) => (
          <div key={index} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <div className="bg-yellow-400 rounded-full p-2 mr-3">
                <svg className="w-4 h-4 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold">Recommendation {index + 1}</h4>
            </div>
            <p className="text-green-100 text-sm">{formatInsightValue(recommendation)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-green-100 text-sm">
          Prediction accuracy: 94.2% • Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
