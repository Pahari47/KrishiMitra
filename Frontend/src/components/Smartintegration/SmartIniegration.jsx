import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiThermometer, 
  FiCloud, 
  FiClock, 
  FiPower, 
  FiRefreshCw,
  FiNavigation
} from 'react-icons/fi';
import mqtt from 'mqtt';

const SmartIntegration = () => {
  // State for sensor data
  const [sensorData, setSensorData] = useState({
    soilMoisture: '--',
    temperature: '--',
    humidity: '--',
    lastUpdated: '--'
  });
  
  // State for pump control
  const [pumpStatus, setPumpStatus] = useState({
    isOn: false,
    isAuto: true,
    lastUsed: 'Never'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [mqttClient, setMqttClient] = useState(null);
  const navigate = useNavigate();

  // MQTT Configuration
  const MQTT_BROKER = 'ws://192.168.120.9:9001'; // WebSocket port for MQTT
  const MQTT_TOPICS = {
    SENSOR_DATA: 'krishii/sensor/#',
    PUMP_CONTROL: 'krishii/pump/control',
    PUMP_MODE: 'krishii/pump/mode'
  };

  // Initialize MQTT connection
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);
    
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe(MQTT_TOPICS.SENSOR_DATA, (err) => {
        if (err) console.error('Subscription error:', err);
      });
      client.subscribe(MQTT_TOPICS.PUMP_CONTROL, (err) => {
        if (err) console.error('Subscription error:', err);
      });
      client.subscribe(MQTT_TOPICS.PUMP_MODE, (err) => {
        if (err) console.error('Subscription error:', err);
      });
    });
    
    client.on('message', (topic, message) => {
      const data = message.toString();
      console.log(`Received message on ${topic}: ${data}`);
      
      const updateTime = new Date().toLocaleTimeString();
      
      if (topic === 'krishii/sensor/soil') {
        setSensorData(prev => ({
          ...prev,
          soilMoisture: `${parseFloat(data).toFixed(1)}%`,
          lastUpdated: updateTime
        }));
      } else if (topic === 'krishii/sensor/temp') {
        setSensorData(prev => ({
          ...prev,
          temperature: `${data}°C`,
          lastUpdated: updateTime
        }));
      } else if (topic === 'krishii/sensor/humidity') {
        setSensorData(prev => ({
          ...prev,
          humidity: `${data}%`,
          lastUpdated: updateTime
        }));
      } else if (topic === MQTT_TOPICS.PUMP_CONTROL) {
        setPumpStatus(prev => ({
          ...prev,
          isOn: data === 'ON',
          lastUsed: updateTime
        }));
      } else if (topic === MQTT_TOPICS.PUMP_MODE) {
        setPumpStatus(prev => ({
          ...prev,
          isAuto: data === 'AUTO'
        }));
      }
    });
    
    client.on('error', (err) => {
      console.error('MQTT error:', err);
      setError('MQTT connection error');
    });
    
    setMqttClient(client);
    
    return () => {
      if (client) {
        client.end();
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
          setIsLoading(false);
        },
        (err) => {
          setError('Location access denied.');
          setLocationPermission('denied');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocationPermission('denied');
    }
  };

  // Toggle pump on/off via MQTT
  const togglePump = () => {
    if (!mqttClient) {
      setError('MQTT connection not established');
      return;
    }
    
    setIsLoading(true);
    const newState = !pumpStatus.isOn;
    
    mqttClient.publish(
      MQTT_TOPICS.PUMP_CONTROL, 
      newState ? 'ON' : 'OFF',
      { qos: 1, retain: false }, // Explicitly set retain to false
      (err) => {
        setIsLoading(false);
        if (err) {
          setError('Failed to send pump command');
          console.error(err);
        } else {
          // Only update local state if publish was successful
          setPumpStatus(prev => ({
            ...prev,
            isOn: newState,
            lastUsed: new Date().toLocaleTimeString()
          }));
        }
      }
    );
  };

  // Toggle auto mode via MQTT
  const toggleAutoMode = () => {
    if (!mqttClient) {
      setError('MQTT connection not established');
      return;
    }
    
    setIsLoading(true);
    const newAutoMode = !pumpStatus.isAuto;
    mqttClient.publish(
      MQTT_TOPICS.PUMP_MODE, 
      newAutoMode ? 'AUTO' : 'MANUAL',
      { qos: 1 },
      (err) => {
        setIsLoading(false);
        if (err) {
          setError('Failed to send mode command');
          console.error(err);
        }
      }
    );
  };

  // Request sensor update
  const requestUpdate = () => {
    if (mqttClient) {
      mqttClient.publish('krishii/sensor/request', 'update');
      setSensorData(prev => ({
        ...prev,
        lastUpdated: 'Requesting update...'
      }));
    }
  };

  // Initial setup
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mt-10 mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Smart Farm Irrigation System</h1>
          <p className="text-gray-600">Real-time monitoring and control via MQTT</p>
        </header>
        
        {/* Location Controls */}
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
                {sensorData.soilMoisture}
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
                {sensorData.temperature}
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
                {sensorData.humidity}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {sensorData.lastUpdated}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={requestUpdate}
              disabled={isLoading}
              className="flex items-center text-sm bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Request Update
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
                  {pumpStatus.isOn ? 'ON' : 'OFF'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600">Mode:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pumpStatus.isAuto ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {pumpStatus.isAuto ? 'AUTO' : 'MANUAL'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <FiClock className="mr-2" /> Last Used:
                </span>
                <span className="text-gray-800 font-medium">
                  {pumpStatus.lastUsed}
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
        <div>
        <motion.button
            className="px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-lg"
            onClick={() => navigate('/croprecommendation')}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              transition: { duration: 0.3 }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center">
              <motion.span
                className="mr-2"
                animate={{
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2
                }}
              >
                🌍
              </motion.span>
              Get Crop Recomendation
              <motion.span
                className="ml-2"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5
                }}
              >
                🔥
              </motion.span>
            </div>
          </motion.button>
        </div>
        
        {/* System Status */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              mqttClient?.connected 
                ? 'bg-green-50 border-green-100' 
                : 'bg-red-50 border-red-100'
            }`}>
              <p className="text-sm mb-1 ${
                mqttClient?.connected ? 'text-green-600' : 'text-red-600'
              }">MQTT Connection</p>
              <p className={`font-medium ${
                mqttClient?.connected ? 'text-green-800' : 'text-red-800'
              }`}>
                {mqttClient?.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Location Services</p>
              <p className="font-medium text-green-800">
                {locationPermission === 'granted' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Last Update</p>
              <p className="font-medium text-green-800">{sensorData.lastUpdated}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">System Mode</p>
              <p className="font-medium text-green-800">
                {pumpStatus.isAuto ? 'Automatic' : 'Manual'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SmartIntegration;