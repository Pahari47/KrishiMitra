import { useState, useEffect } from 'react';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load and validate history from localStorage on component mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem('cropPredictionHistory');
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          
          // Filter out expired entries and invalid data
          const validHistory = parsedHistory.filter(entry => {
            return entry.expiresAt && 
                   entry.expiresAt > Date.now() && 
                   entry.predicted_crop && 
                   entry.timestamp;
          });
          
          if (validHistory.length !== parsedHistory.length) {
            localStorage.setItem('cropPredictionHistory', JSON.stringify(validHistory));
          }
          
          setHistory(validHistory);
        }
      } catch (err) {
        console.error('Error loading history:', err);
        localStorage.removeItem('cropPredictionHistory');
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = (payload) => {
    const errors = [];
    
    if (payload.N < 0 || payload.N > 200) errors.push('Nitrogen (N) should be between 0-200');
    if (payload.P < 0 || payload.P > 200) errors.push('Phosphorus (P) should be between 0-200');
    if (payload.K < 0 || payload.K > 200) errors.push('Potassium (K) should be between 0-200');
    if (payload.temperature < -20 || payload.temperature > 60) errors.push('Temperature should be between -20°C to 60°C');
    if (payload.humidity < 0 || payload.humidity > 100) errors.push('Humidity should be between 0-100%');
    if (payload.ph < 0 || payload.ph > 14) errors.push('pH level should be between 0-14');
    if (payload.rainfall < 0 || payload.rainfall > 1000) errors.push('Rainfall should be between 0-1000mm');
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Validate all fields are filled
      if (Object.values(formData).some(val => val === '')) {
        throw new Error('Please fill in all fields');
      }

      // Convert numeric fields to numbers
      const payload = {
        N: Number(formData.N),
        P: Number(formData.P),
        K: Number(formData.K),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        rainfall: Number(formData.rainfall)
      };

      // Validate input ranges
      validateInputs(payload);

      // API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://predictionapicrop.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed with status ' + response.status);
      }

      const data = await response.json();
      
      if (!data.predicted_crop) {
        throw new Error('Invalid response from server');
      }

      setPrediction(data.predicted_crop);

      // Save to history with expiration (30 days)
      const newEntry = {
        ...payload,
        predicted_crop: data.predicted_crop,
        timestamp: new Date().toISOString(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
      };
      
      const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10 entries
      setHistory(updatedHistory);
      localStorage.setItem('cropPredictionHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timed out. Please try again.' 
        : err.message || 'Failed to get prediction. Please check your connection.';
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your prediction history?')) {
      localStorage.removeItem('cropPredictionHistory');
      setHistory([]);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mt-10 mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Crop Recommendation System</h1>
          <p className="text-gray-600">Enter soil and weather parameters to get the best crop recommendation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Parameters</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (N) (0-200)</label>
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 90"
                    min="0"
                    max="200"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (P) (0-200)</label>
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 42"
                    min="0"
                    max="200"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (K) (0-200)</label>
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 43"
                    min="0"
                    max="200"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C) (-20 to 60)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 35"
                    min="-20"
                    max="60"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%) (0-100)</label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 80"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">pH Level (0-14)</label>
                  <input
                    type="number"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 6.5"
                    min="0"
                    max="14"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rainfall (mm) (0-1000)</label>
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 250"
                    min="0"
                    max="1000"
                    step="1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </>
                  ) : 'Get Recommendation'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-line">
                {error}
                <button 
                  onClick={handleSubmit}
                  className="block mt-2 text-red-700 font-medium hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Prediction Result */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendation Result</h2>
              {prediction ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600 mb-2">The recommended crop is:</p>
                  <p className="text-3xl font-bold text-green-600 capitalize">{prediction}</p>
                  <div className="mt-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>Enter soil and weather parameters to get a crop recommendation</p>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Previous Predictions</h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {history.map((entry, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{entry.predicted_crop}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        N: {entry.N}, P: {entry.P}, K: {entry.K}
                      </div>
                      <div className="text-xs text-gray-500">
                        Temp: {entry.temperature}°C, Hum: {entry.humidity}%, pH: {entry.ph}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;