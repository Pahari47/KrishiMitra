import React, { useState, useEffect } from 'react';
import { 
  FiDroplet, 
  FiThermometer, 
  FiCloud, 
  FiClock, 
  FiPower, 
  FiRefreshCw,
  FiNavigation
} from 'react-icons/fi';
import axios from 'axios';

const SmartIntegration = () => {
  // State for all sensor data (now coming from pump API)
  const [sensorData, setSensorData] = useState({
    soilMoisture: '--',
    temperature: '--',
    humidity: '--',
    lastUpdated: '--'
  });
  
  // State for pump control
  const [pumpStatus, setPumpStatus] = useState({
    isOn: false,
    isAuto: false,
    lastUsed: 'Never'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [locationPermission, setLocationPermission] = useState('prompt');

  // pump API endpoint
  const PUMP_API_URL = 'https://your-farm-api.example.com/pump';

  // Get user's current location (kept for reference, though not used for API calls now)
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
        },
        (err) => {
          setError('Location access denied.');
          setLocationPermission('denied');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocationPermission('denied');
    }
  };

  // Fetch all sensor data and pump status from pump API
  const fetchPumpData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // API call - this would be your actual pump API endpoint
      // const response = await axios.get(`${PUMP_API_URL}`);
      // const data = response.data;
      
      // Mock response for demonstration
      const mockResponse = {
        // Sensor data
        soilMoisture: `${Math.floor(Math.random() * 100)}%`,
        temperature: `${Math.floor(Math.random() * 30) + 10}°C`, // 10-40°C range
        humidity: `${Math.floor(Math.random() * 50) + 30}%`, // 30-80% range
        lastUpdated: new Date().toLocaleTimeString(),
        
        // Pump status
        isOn: Math.random() > 0.5,
        isAuto: Math.random() > 0.5,
        lastUsed: `${Math.floor(Math.random() * 24)} hours ago`
      };
      
      // Update both sensor data and pump status from the same API response
      setSensorData({
        soilMoisture: mockResponse.soilMoisture,
        temperature: mockResponse.temperature,
        humidity: mockResponse.humidity,
        lastUpdated: mockResponse.lastUpdated
      });
      
      setPumpStatus({
        isOn: mockResponse.isOn,
        isAuto: mockResponse.isAuto,
        lastUsed: mockResponse.lastUsed
      });
    } catch (err) {
      setError('Failed to fetch data from pump controller');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pump on/off
  const togglePump = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would be an actual API call
      // await axios.post(`${PUMP_API_URL}/toggle`);
      
      // Mock response for demonstration
      setPumpStatus(prev => ({
        ...prev,
        isOn: !prev.isOn,
        lastUsed: 'Just now'
      }));
      
      // Also update the lastUpdated time for sensor data
      setSensorData(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString()
      }));
    } catch (err) {
      setError('Failed to toggle pump');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle auto mode
  const toggleAutoMode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would be an actual API call
      // await axios.post(`${PUMP_API_URL}/auto`);
      
      // Mock response for demonstration
      setPumpStatus(prev => ({
        ...prev,
        isAuto: !prev.isAuto
      }));
    } catch (err) {
      setError('Failed to toggle auto mode');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getCurrentLocation();
    fetchPumpData();
    
    // Set up polling for updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchPumpData();
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mt-10 mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Smart Farm Irrigation System</h1>
          <p className="text-gray-600">Monitor farm conditions and control irrigation</p>
        </header>
        
        {/* Location Controls (kept but not essential for functionality) */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-medium text-gray-700 mb-1">Current Location</h2>
              <p className="text-lg font-semibold">
                {coords.lat ? `Lat: ${coords.lat.toFixed(4)}, Lon: ${coords.lon.toFixed(4)}` : '--'}
              </p>
            </div>
            <button
              onClick={getCurrentLocation}
              className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              <FiNavigation className="mr-2" />
              Use My Location
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Sensor Data Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FiCloud className="mr-2" /> Farm Conditions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Moisture Card */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <FiDroplet className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-medium text-gray-700 mb-1">Soil Moisture</h3>
              <p className="text-3xl font-bold text-blue-600">
                {isLoading ? '...' : sensorData.soilMoisture}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {sensorData.lastUpdated}
              </p>
            </div>
            
            {/* Temperature Card */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="bg-orange-100 p-3 rounded-full mb-3">
                <FiThermometer className="text-orange-600 text-2xl" />
              </div>
              <h3 className="font-medium text-gray-700 mb-1">Temperature</h3>
              <p className="text-3xl font-bold text-orange-600">
                {isLoading ? '...' : sensorData.temperature}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {sensorData.lastUpdated}
              </p>
            </div>
            
            {/* Humidity Card */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="bg-teal-100 p-3 rounded-full mb-3">
                <FiCloud className="text-teal-600 text-2xl" />
              </div>
              <h3 className="font-medium text-gray-700 mb-1">Humidity</h3>
              <p className="text-3xl font-bold text-teal-600">
                {isLoading ? '...' : sensorData.humidity}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {sensorData.lastUpdated}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={fetchPumpData}
              disabled={isLoading}
              className="flex items-center text-sm bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </section>
        
        {/* Pump Control Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FiPower className="mr-2" /> Water Pump Control
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pump Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-700 mb-4">Pump Status</h3>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600">Current State:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pumpStatus.isOn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isLoading ? '...' : pumpStatus.isOn ? 'ON' : 'OFF'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600">Mode:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pumpStatus.isAuto ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isLoading ? '...' : pumpStatus.isAuto ? 'AUTO' : 'MANUAL'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <FiClock className="mr-2" /> Last Used:
                </span>
                <span className="text-gray-800 font-medium">
                  {isLoading ? '...' : pumpStatus.lastUsed}
                </span>
              </div>
            </div>
            
            {/* Pump Controls Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-700 mb-4">Pump Controls</h3>
              
              <div className="space-y-4">
                <button
                  onClick={togglePump}
                  disabled={isLoading || pumpStatus.isAuto}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                    pumpStatus.isAuto 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : pumpStatus.isOn 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } transition`}
                >
                  <FiPower className="mr-2" />
                  {pumpStatus.isOn ? 'Turn Pump OFF' : 'Turn Pump ON'}
                </button>
                
                <button
                  onClick={toggleAutoMode}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                    pumpStatus.isAuto 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  } transition`}
                >
                  <FiRefreshCw className="mr-2" />
                  {pumpStatus.isAuto ? 'Disable Auto Mode' : 'Enable Auto Mode'}
                </button>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {pumpStatus.isAuto 
                      ? "In auto mode, the pump will turn on/off automatically based on soil moisture levels."
                      : "In manual mode, you control the pump directly with the ON/OFF button."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* System Status */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Pump Controller</p>
              <p className="font-medium text-green-800">Connected</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Location Services</p>
              <p className="font-medium text-green-800">
                {locationPermission === 'granted' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Sensors</p>
              <p className="font-medium text-green-800">Online</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Last Sync</p>
              <p className="font-medium text-green-800">{sensorData.lastUpdated}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SmartIntegration;