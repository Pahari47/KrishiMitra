import React, { useState, useEffect } from 'react';
import { 
  FiDroplet, FiThermometer, FiCloud, FiWind, FiMapPin, 
  FiSun, FiCalendar, FiRefreshCw, FiNavigation, FiDatabase 
} from 'react-icons/fi';
import mqtt from 'mqtt';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeatherSoildata = () => {
  // Weather data state
  const [weatherData, setWeatherData] = useState({
    location: '--',
    humidity: '--',
    temperature: '--',
    skyCondition: '--',
    windSpeed: '--',
    lastUpdated: '--'
  });

  const skyConditionIcons = {
    'clear': <FiSun className="text-yellow-500 text-2xl" />,
    'clouds': <FiCloud className="text-gray-500 text-2xl" />,
    'rain': <FiDroplet className="text-blue-500 text-2xl" />,
    'thunderstorm': <FiCloud className="text-purple-500 text-2xl" />,
    'drizzle': <FiDroplet className="text-blue-300 text-2xl" />,
    'snow': <FiCloud className="text-blue-100 text-2xl" />,
    'mist': <FiCloud className="text-gray-300 text-2xl" />,
    'default': <FiCloud className="text-gray-500 text-2xl" />
  };
  
  // Soil data state (now from MQTT)
  const [soilData, setSoilData] = useState({
    moisture: '--',
    temperature: '--',
    humidity: '--',
    lastUpdated: '--'
  });
  
  // Historical data state
  const [historicalData, setHistoricalData] = useState({
    temperature: [],
    rainfall: [],
    dates: [],
    maxTemp: '--',
    minTemp: '--',
    maxRainfall: '--',
    minRainfall: '--'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [daysToShow, setDaysToShow] = useState(7);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [mqttClient, setMqttClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // MQTT Configuration
  const MQTT_BROKER = 'ws://192.168.120.9:9001';
  const MQTT_TOPICS = {
    SOIL_MOISTURE: 'krishii/sensor/soil',
    SOIL_TEMP: 'krishii/sensor/temp',
    SOIL_HUMIDITY: 'krishii/sensor/humidity'
  };

  // API endpoints
  const WEATHER_API_KEY = '824486414437db7a528a1d6737b565f7';
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Temperature chart configuration
  const tempChartData = {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: historicalData.temperature,
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const tempChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${daysToShow}-Day Temperature Trend`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };

  // Rainfall chart configuration
  const rainChartData = {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: historicalData.rainfall,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ]
  };

  const rainChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${daysToShow}-Day Rainfall`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rainfall (mm)'
        }
      }
    }
  };

  // Initialize MQTT connection
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
      clean: true
    });

    client.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to MQTT broker');
      
      const subscribeToTopic = (topic) => {
        client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Subscription error for ${topic}:`, err);
            setTimeout(() => subscribeToTopic(topic), 2000);
          } else {
            console.log(`Subscribed to ${topic}`);
          }
        });
      };

      subscribeToTopic(MQTT_TOPICS.SOIL_MOISTURE);
      subscribeToTopic(MQTT_TOPICS.SOIL_TEMP);
      subscribeToTopic(MQTT_TOPICS.SOIL_HUMIDITY);
    });

    client.on('message', (topic, message) => {
      const data = message.toString();
      const updateTime = new Date().toLocaleTimeString();
      
      switch(topic) {
        case MQTT_TOPICS.SOIL_MOISTURE:
          setSoilData(prev => ({
            ...prev,
            moisture: `${parseFloat(data).toFixed(1)}%`,
            lastUpdated: updateTime
          }));
          break;
          
        case MQTT_TOPICS.SOIL_TEMP:
          setSoilData(prev => ({
            ...prev,
            temperature: `${parseFloat(data).toFixed(1)}°C`,
            lastUpdated: updateTime
          }));
          break;
          
        case MQTT_TOPICS.SOIL_HUMIDITY:
          setSoilData(prev => ({
            ...prev,
            humidity: `${parseFloat(data).toFixed(1)}%`,
            lastUpdated: updateTime
          }));
          break;
          
        default:
          console.log('Received message on unhandled topic:', topic);
      }
    });

    client.on('error', (err) => {
      setConnectionStatus('error');
      console.error('Connection error:', err);
      setError('MQTT connection error');
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

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationPermission('granted');
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
          generateHistoricalData();
        },
        (err) => {
          setError('Location access denied. Using default location.');
          setLocationPermission('denied');
          const defaultLat = 40.7128;
          const defaultLon = -74.0060;
          setCoords({ lat: defaultLat, lon: defaultLon });
          fetchWeatherData(defaultLat, defaultLon);
          generateHistoricalData();
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocationPermission('denied');
    }
  };

  // Fetch current weather data
  const fetchWeatherData = async (lat, lon) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      const data = response.data;
      const condition = data.weather[0].main.toLowerCase();
      
      setWeatherData({
        location: data.name,
        humidity: `${data.main.humidity}%`,
        temperature: `${Math.round(data.main.temp)}°C`,
        skyCondition: condition,
        windSpeed: `${(data.wind.speed * 3.6).toFixed(1)} km/h`,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Request soil data update via MQTT
  const requestSoilUpdate = () => {
    if (mqttClient) {
      mqttClient.publish('krishii/sensor/request', 'update');
      setSoilData(prev => ({
        ...prev,
        lastUpdated: 'Requesting update...'
      }));
    }
  };

  // Generate historical data
  const generateHistoricalData = () => {
    const tempData = [];
    const rainData = [];
    const dates = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      tempData.push(Math.floor(Math.random() * 15) + 15);
      rainData.push(Math.random() > 0.7 ? (Math.random() * 10).toFixed(1) : 0);
    }
    
    setHistoricalData({
      temperature: tempData,
      rainfall: rainData,
      dates: dates,
      maxTemp: `${Math.max(...tempData)}°C`,
      minTemp: `${Math.min(...tempData)}°C`,
      maxRainfall: `${Math.max(...rainData)} mm`,
      minRainfall: `${Math.min(...rainData)} mm`
    });
  };

  // Initial data fetch
  useEffect(() => {
    getCurrentLocation();
    
    const interval = setInterval(() => {
      if (coords.lat && coords.lon) {
        fetchWeatherData(coords.lat, coords.lon);
      }
    }, 1800000);
    
    return () => clearInterval(interval);
  }, []);

  // Update historical data when daysToShow changes
  useEffect(() => {
    generateHistoricalData();
  }, [daysToShow]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mt-10 mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Smart Farm Dashboard</h1>
          <p className="text-gray-600">Weather and soil monitoring system</p>
        </header>
        
        {/* Connection Status */}
        <div className="mb-4 flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <span className="text-sm">
            MQTT: {connectionStatus}
          </span>
        </div>

        {/* Location Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-medium text-gray-700 mb-1">Current Location</h2>
              <p className="text-lg font-semibold">
                {weatherData.location} ({coords.lat ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : '--'})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
              >
                <FiNavigation className="mr-2" />
                Use My Location
              </button>
              <select
                value={daysToShow}
                onChange={(e) => setDaysToShow(parseInt(e.target.value))}
                className="bg-white border border-gray-300 rounded px-3 py-2"
              >
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Current Weather Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FiCloud className="mr-2" /> Current Weather Conditions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiMapPin className="text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-700">Location</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? '...' : weatherData.location}
              </p>
            </div>
            
            {/* Temperature Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiThermometer className="text-orange-500 mr-2" />
                <h3 className="font-medium text-gray-700">Temperature</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {isLoading ? '...' : weatherData.temperature}
              </p>
            </div>
            
            {/* Humidity Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiDroplet className="text-blue-500 mr-2" />
                <h3 className="font-medium text-gray-700">Humidity</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : weatherData.humidity}
              </p>
            </div>
            
            {/* Sky Condition Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                {weatherData.skyCondition in skyConditionIcons 
                  ? skyConditionIcons[weatherData.skyCondition]
                  : skyConditionIcons['default']}
                <h3 className="font-medium text-gray-700 ml-2">Sky Condition</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 capitalize">
                {isLoading ? '...' : weatherData.skyCondition}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Last updated: {weatherData.lastUpdated}
            </p>
            <button 
              onClick={() => {
                if (coords.lat && coords.lon) {
                  fetchWeatherData(coords.lat, coords.lon);
                  generateHistoricalData();
                }
              }}
              disabled={isLoading}
              className="flex items-center text-sm bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Weather Data
            </button>
          </div>
        </section>
        
        {/* Soil Data Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FiDatabase className="mr-2" /> Soil Conditions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Soil Moisture Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiDroplet className="text-teal-500 mr-2" />
                <h3 className="font-medium text-gray-700">Soil Moisture</h3>
              </div>
              <p className="text-2xl font-bold text-teal-600">
                {soilData.moisture}
              </p>
            </div>
            
            {/* Soil Temperature Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiThermometer className="text-amber-500 mr-2" />
                <h3 className="font-medium text-gray-700">Soil Temperature</h3>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {soilData.temperature}
              </p>
            </div>
            
            {/* Soil Humidity Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <FiDroplet className="text-indigo-500 mr-2" />
                <h3 className="font-medium text-gray-700">Soil Humidity</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {soilData.humidity}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Last updated: {soilData.lastUpdated}
            </p>
            <button 
              onClick={requestSoilUpdate}
              disabled={isLoading || !mqttClient || connectionStatus !== 'connected'}
              className="flex items-center text-sm bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Request Soil Update
            </button>
          </div>
        </section>
        
        {/* Historical Data Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Historical Weather Data (Last {daysToShow} Days)
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Temperature Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64">
                {historicalData.temperature.length > 0 ? (
                  <Line data={tempChartData} options={tempChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading temperature data...
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-600">Highest Temp</p>
                  <p className="font-bold text-orange-800">{historicalData.maxTemp}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Lowest Temp</p>
                  <p className="font-bold text-blue-800">{historicalData.minTemp}</p>
                </div>
              </div>
            </div>
            
            {/* Rainfall Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64">
                {historicalData.rainfall.length > 0 ? (
                  <Bar data={rainChartData} options={rainChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading rainfall data...
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Highest Rainfall</p>
                  <p className="font-bold text-blue-800">{historicalData.maxRainfall}</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-sm text-teal-600">Lowest Rainfall</p>
                  <p className="font-bold text-teal-800">{historicalData.minRainfall}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* System Status */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              connectionStatus === 'connected' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
            }`}>
              <p className="text-sm mb-1">MQTT Connection</p>
              <p className="font-medium">
                {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Weather API</p>
              <p className="font-medium text-green-800">Connected</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Last Data Sync</p>
              <p className="font-medium text-green-800">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">System Health</p>
              <p className="font-medium text-green-800">Optimal</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WeatherSoildata;