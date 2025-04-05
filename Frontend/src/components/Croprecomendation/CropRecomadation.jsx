import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';

const CropRecommendation = () => {
  const parameterRanges = {
    N: { min: 0, max: 200 },
    P: { min: 0, max: 200 },
    K: { min: 0, max: 200 },
    temperature: { min: -20, max: 60 },
    humidity: { min: 0, max: 100 },
    ph: { min: 0, max: 14 },
    rainfall: { min: 0, max: 1000 }
  };

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
  const [isRandomized, setIsRandomized] = useState(false);
  const [mqttClient, setMqttClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [coords, setCoords] = useState({ lat: null, lon: null });

  // MQTT Configuration
  const MQTT_BROKER = 'ws://192.168.120.9:9001';
  const MQTT_TOPICS = {
    TEMPERATURE: 'krishii/sensor/temp',
    HUMIDITY: 'krishii/sensor/humidity'
  };

  // Weather API Configuration
  const WEATHER_API_KEY = '824486414437db7a528a1d6737b565f7';
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Initialize MQTT connection
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clientId: 'crop-rec-client-' + Math.random().toString(16).substr(2, 8),
      clean: true
    });

    client.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to MQTT broker');
      
      client.subscribe(MQTT_TOPICS.TEMPERATURE, { qos: 1 }, (err) => {
        if (err) console.error('Temperature subscription error:', err);
      });
      client.subscribe(MQTT_TOPICS.HUMIDITY, { qos: 1 }, (err) => {
        if (err) console.error('Humidity subscription error:', err);
      });
    });

    client.on('message', (topic, message) => {
      const data = message.toString();
      console.log(`Received message on ${topic}: ${data}`);

      if (topic === MQTT_TOPICS.TEMPERATURE) {
        setFormData(prev => ({
          ...prev,
          temperature: data
        }));
      } else if (topic === MQTT_TOPICS.HUMIDITY) {
        setFormData(prev => ({
          ...prev,
          humidity: data
        }));
      }
    });

    client.on('error', (err) => {
      setConnectionStatus('error');
      console.error('Connection error:', err);
    });

    client.on('close', () => {
      setConnectionStatus('disconnected');
      console.log('Connection closed');
    });

    client.on('reconnect', () => {
      setConnectionStatus('reconnecting');
      console.log('Attempting to reconnect...');
    });

    setMqttClient(client);

    return () => {
      if (client) {
        client.end(true, () => {
          console.log('Cleanly disconnected MQTT client');
        });
      }
    };
  }, []);

  // Get user location and fetch weather data
  useEffect(() => {
    const getLocationAndWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error('Location access denied:', err);
            // Fallback to default location (New York)
            const defaultLat = 40.7128;
            const defaultLon = -74.0060;
            setCoords({ lat: defaultLat, lon: defaultLon });
            fetchWeatherData(defaultLat, defaultLon);
          }
        );
      } else {
        console.error('Geolocation not supported');
      }
    };

    getLocationAndWeather();

    // Fetch weather data every 30 minutes
    const interval = setInterval(() => {
      if (coords.lat && coords.lon) {
        fetchWeatherData(coords.lat, coords.lon);
      }
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

  // Fetch weather data for rainfall
  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      const rainfall = response.data.rain ? response.data.rain['1h'] || 0 : 0;
      setFormData(prev => ({
        ...prev,
        rainfall: rainfall.toFixed(1)
      }));
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    }
  };

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('cropPredictionHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (err) {
        console.error('Error parsing history:', err);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('cropPredictionHistory', JSON.stringify(history));
    }
  }, [history]);

  const generateRandomData = () => {
    const newData = {};
    Object.keys(parameterRanges).forEach(key => {
      // Skip temperature and humidity if we have MQTT data
      if ((key === 'temperature' || key === 'humidity') && connectionStatus === 'connected') {
        return;
      }
      
      // Skip rainfall if we have weather API data
      if (key === 'rainfall' && coords.lat && coords.lon) {
        return;
      }

      const { min, max } = parameterRanges[key];
      const value = key === 'ph'
        ? (Math.random() * (max - min) + min).toFixed(1)
        : Math.floor(Math.random() * (max - min + 1) + min);
      newData[key] = value.toString();
    });
    
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
    setIsRandomized(true);
    setPrediction(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {};
      Object.keys(formData).forEach(key => {
        payload[key] = parseFloat(formData[key]);
      });

      const response = await fetch('https://predictionapicrop.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setPrediction(data.predicted_crop);

      const newEntry = {
        ...payload,
        predicted_crop: data.predicted_crop,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
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
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl mt-10 font-bold text-green-800 mb-2">Smart Crop Recommendation</h1>
          <p className="text-gray-600">Get AI-powered crop suggestions based on environmental conditions</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            Sensor Data: {connectionStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Soil & Weather Parameters</h2>
              <button
                onClick={generateRandomData}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition"
              >
                Get Data
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key === 'N' ? 'Nitrogen (N)' :
                        key === 'P' ? 'Phosphorus (P)' :
                          key === 'K' ? 'Potassium (K)' :
                            key === 'ph' ? 'pH Level' :
                              key.charAt(0).toUpperCase() + key.slice(1)}
                      <span className="text-gray-500 ml-1">
                        ({parameterRanges[key].min}-{parameterRanges[key].max}
                        {key === 'temperature' ? '°C' : key === 'humidity' ? '%' : key === 'rainfall' ? 'mm' : ''})
                      </span>
                      {(key === 'temperature' || key === 'humidity' || key === 'rainfall') && (
                        <span className="ml-2 text-xs text-green-600">
                          {key === 'rainfall' ? 'from weather API' : 'from sensors'}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                      readOnly={key === 'temperature' || key === 'humidity' || key === 'rainfall'}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Get Recommendation'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendation Result</h2>
              {prediction ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-600 mb-2">The optimal crop for these conditions is:</p>
                  <p className="text-3xl font-bold text-green-600 capitalize">{prediction}</p>
                  <p className="mt-4 text-sm text-gray-500">
                    Based on current soil and weather parameters
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>Enter parameters or generate random data to get a recommendation</p>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Prediction History</h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        const newFormData = {};
                        Object.keys(formData).forEach(key => {
                          newFormData[key] = entry[key].toString();
                        });
                        setFormData(newFormData);
                        setPrediction(entry.predicted_crop);
                        setIsRandomized(true);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{entry.predicted_crop}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mt-1">
                        <span>N: {entry.N}</span>
                        <span>P: {entry.P}</span>
                        <span>K: {entry.K}</span>
                        <span>Temp: {entry.temperature}°C</span>
                        <span>Hum: {entry.humidity}%</span>
                        <span>pH: {entry.ph}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This AI model analyzes soil nutrients and weather conditions to recommend the most suitable crops.</p>
          <p className="mt-1">Temperature and humidity are fetched from sensors via MQTT, rainfall from weather API.</p>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;