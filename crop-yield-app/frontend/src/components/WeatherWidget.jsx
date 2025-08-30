import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ weatherData, forecast, location = 'Mumbai' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (weatherCode) => {
    const icons = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[weatherCode] || '🌤️';
  };

  const getCropRecommendations = (weather) => {
    const temp = weather?.main?.temp || 25;
    const humidity = weather?.main?.humidity || 60;
    const description = weather?.weather?.[0]?.description || '';

    let recommendations = [];

    if (temp > 30) {
      recommendations.push('High temperature - increase irrigation frequency');
    } else if (temp < 15) {
      recommendations.push('Low temperature - protect crops from cold stress');
    }

    if (humidity > 80) {
      recommendations.push('High humidity - monitor for fungal diseases');
    } else if (humidity < 40) {
      recommendations.push('Low humidity - consider misting systems');
    }

    if (description.includes('rain')) {
      recommendations.push('Rain expected - delay pesticide application');
    }

    if (description.includes('wind')) {
      recommendations.push('Windy conditions - secure crop covers');
    }

    return recommendations.length > 0 ? recommendations : ['Weather conditions are favorable for crop growth'];
  };

  const getWeatherAlert = (weather) => {
    const temp = weather?.main?.temp || 25;
    const humidity = weather?.main?.humidity || 60;
    const windSpeed = weather?.wind?.speed || 0;

    if (temp > 35) return { type: 'warning', message: 'High temperature alert - crops may need extra care' };
    if (temp < 10) return { type: 'warning', message: 'Low temperature alert - protect sensitive crops' };
    if (windSpeed > 10) return { type: 'info', message: 'High winds - secure farm equipment' };
    if (humidity > 90) return { type: 'info', message: 'High humidity - monitor for disease development' };

    return null;
  };

  const alert = getWeatherAlert(weatherData);
  const recommendations = getCropRecommendations(weatherData);

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Current Weather</h3>
            <p className="text-blue-100">{location}</p>
            <p className="text-sm text-blue-200">{currentTime.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-1">
              {weatherData?.weather?.[0]?.icon ? 
                getWeatherIcon(weatherData.weather[0].icon) : '🌤️'
              }
            </div>
            <p className="text-sm text-blue-200">
              {weatherData?.weather?.[0]?.description || 'Partly cloudy'}
            </p>
          </div>
        </div>

        {weatherData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <div className="text-2xl font-bold">{weatherData.main?.temp}°C</div>
              <div className="text-sm text-blue-100">Temperature</div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <div className="text-2xl font-bold">{weatherData.main?.humidity}%</div>
              <div className="text-sm text-blue-100">Humidity</div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <div className="text-2xl font-bold">{weatherData.main?.pressure} hPa</div>
              <div className="text-sm text-blue-100">Pressure</div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <div className="text-2xl font-bold">{weatherData.wind?.speed} m/s</div>
              <div className="text-sm text-blue-100">Wind Speed</div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Alert */}
      {alert && (
        <div className={`rounded-xl p-4 ${
          alert.type === 'warning' 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <span className="text-lg mr-2">
              {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className={`font-semibold ${
              alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
            }`}>
              {alert.message}
            </span>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">5-Day Forecast</h3>
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {day.weather?.[0]?.icon ? getWeatherIcon(day.weather[0].icon) : '🌤️'}
                </span>
                <div>
                  <div className="font-medium text-gray-800">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.weather?.[0]?.description || 'Partly cloudy'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{day.main?.temp}°C</div>
                <div className="text-sm text-gray-500">{day.main?.humidity}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crop Recommendations */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Crop Recommendations</h3>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span className="text-green-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">UV Index</h4>
          <div className="text-2xl font-bold text-orange-600">6.2</div>
          <div className="text-sm text-gray-600">Moderate</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Visibility</h4>
          <div className="text-2xl font-bold text-blue-600">10 km</div>
          <div className="text-sm text-gray-600">Excellent</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
