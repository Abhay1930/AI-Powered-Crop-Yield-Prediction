import React, { useState, useEffect } from 'react';

const FarmDataForm = ({ onPredict }) => {
  const [form, setForm] = useState({
    state_name: '',
    district_name: '',
    season: '',
    crop: '',
    crop_year: new Date().getFullYear(),
    area: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uniqueValues, setUniqueValues] = useState({
    states: [],
    districts: [],
    seasons: [],
    crops: []
  });
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Fetch unique values on component mount
  useEffect(() => {
    fetchUniqueValues();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (form.state_name) {
      fetchDistrictsForState(form.state_name);
    } else {
      setAvailableDistricts([]);
    }
  }, [form.state_name]);

  const fetchUniqueValues = async () => {
    try {
      const { getUniqueValues } = await import('../services/api');
      const response = await getUniqueValues();
      setUniqueValues(response.data);
    } catch (error) {
      console.error('Error fetching unique values:', error);
    }
  };

  const fetchDistrictsForState = async (state) => {
    try {
      const { getDistrictsForState } = await import('../services/api');
      const response = await getDistrictsForState(state);
      setAvailableDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setAvailableDistricts([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear district when state changes
    if (name === 'state_name') {
      setForm(prev => ({ ...prev, [name]: value, district_name: '' }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.state_name.trim()) {
      newErrors.state_name = 'State is required';
    }
    if (!form.district_name.trim()) {
      newErrors.district_name = 'District is required';
    }
    if (!form.season.trim()) {
      newErrors.season = 'Season is required';
    }
    if (!form.crop.trim()) {
      newErrors.crop = 'Crop is required';
    }
    if (!form.crop_year || form.crop_year < 2000 || form.crop_year > 2030) {
      newErrors.crop_year = 'Crop year must be between 2000 and 2030';
    }
    if (!form.area || form.area <= 0) {
      newErrors.area = 'Area must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert string values to appropriate types for the ML model
      const predictionData = {
        ...form,
        crop_year: parseInt(form.crop_year),
        area: parseFloat(form.area)
      };
      
      console.log('🚀 Submitting prediction from form:', predictionData);
      await onPredict(predictionData);
      
      // Success message will be handled by the App component
      // The user will be redirected to dashboard automatically
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error submitting prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    {
      name: 'state_name',
      label: 'State',
      placeholder: 'Select state',
      type: 'select',
      options: uniqueValues.states,
      icon: '🗺️',
      required: true
    },
    {
      name: 'district_name',
      label: 'District',
      placeholder: 'Select district',
      type: 'select',
      options: availableDistricts,
      icon: '🏘️',
      required: true,
      disabled: !form.state_name
    },
    {
      name: 'season',
      label: 'Season',
      placeholder: 'Select season',
      type: 'select',
      options: uniqueValues.seasons,
      icon: '🌤️',
      required: true
    },
    {
      name: 'crop',
      label: 'Crop',
      placeholder: 'Select crop',
      type: 'select',
      options: uniqueValues.crops,
      icon: '🌾',
      required: true
    },
    {
      name: 'crop_year',
      label: 'Crop Year',
      placeholder: 'Enter crop year',
      type: 'number',
      min: '2000',
      max: '2030',
      icon: '📅'
    },
    {
      name: 'area',
      label: 'Area (Hectares)',
      placeholder: 'Enter area in hectares',
      type: 'number',
      step: '0.01',
      min: '0.01',
      icon: '📏'
    }
  ];

  const renderInputField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          id={field.name}
          name={field.name}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
            errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={form[field.name]}
          onChange={handleChange}
          disabled={field.disabled}
          required={field.required}
        >
          <option value="">{field.placeholder}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        step={field.step}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
          errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        value={form[field.name]}
        onChange={handleChange}
        required={field.required}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crop Production Prediction</h2>
            <p className="text-lg text-gray-600">Enter location and crop details to get AI-powered production predictions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    <span className="mr-2">{field.icon}</span>
                    {field.label}
                  </label>
                  {renderInputField(field)}
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Prediction...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Predict Production
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select your state and district</li>
              <li>• Choose the crop and season</li>
              <li>• Enter the area and crop year</li>
              <li>• Get accurate production predictions and farming insights</li>
              <li>• View detailed results in your personalized dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDataForm;
