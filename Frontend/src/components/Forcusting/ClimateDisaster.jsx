import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subMonths, parseISO } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
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

const ClimateDashboard = () => {
  const [location, setLocation] = useState('London');
  const [timeRange, setTimeRange] = useState('6');
  const [temperatureData, setTemperatureData] = useState(null);
  const [rainfallData, setRainfallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch climate data from Open-Meteo API
  const fetchClimateData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, parseInt(timeRange));
      
      // Format dates for API
      const formatDate = (date) => format(date, 'yyyy-MM-dd');
      
      // Fetch historical climate data
      const response = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
        params: {
          latitude: 51.5074, // London by default
          longitude: -0.1278,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
          timezone: 'auto'
        }
      });
      
      const { daily } = response.data;
      
      // Process temperature data
      const tempData = {
        dates: daily.time.map(date => format(parseISO(date), 'MMM yyyy')),
        maxTemps: daily.temperature_2m_max,
        minTemps: daily.temperature_2m_min,
      };
      
      // Process rainfall data
      const rainData = {
        dates: daily.time.map(date => format(parseISO(date), 'MMM yyyy')),
        precipitation: daily.precipitation_sum,
      };
      
      setTemperatureData(tempData);
      setRainfallData(rainData);
      
    } catch (err) {
      setError('Failed to fetch climate data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClimateData();
  }, [timeRange]);

  // Forecast data (mock - in a real app you'd get this from an API)
  const getForecastData = () => {
    const forecastMonths = 3;
    const forecastDates = [];
    
    for (let i = 1; i <= forecastMonths; i++) {
      forecastDates.push(format(subMonths(new Date(), -i), 'MMM yyyy'));
    }
    
    return {
      heatwaveForecast: forecastDates.map(() => Math.random() * 5 + 30), // Random temps between 30-35
      floodForecast: forecastDates.map(() => Math.random() * 50), // Random rainfall between 0-50mm
      dates: forecastDates,
    };
  };

  const forecastData = getForecastData();

  // Temperature chart config
  const tempChartData = {
    labels: temperatureData?.dates || [],
    datasets: [
      {
        label: 'Max Temperature (°C)',
        data: temperatureData?.maxTemps || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Min Temperature (°C)',
        data: temperatureData?.minTemps || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Rainfall chart config
  const rainChartData = {
    labels: rainfallData?.dates || [],
    datasets: [
      {
        label: 'Precipitation (mm)',
        data: rainfallData?.precipitation || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Heatwave chart config
  const heatwaveChartData = {
    labels: temperatureData?.dates || [],
    datasets: [
      {
        label: 'Heatwave Days (Temp > 30°C)',
        data: temperatureData?.maxTemps?.map(temp => temp > 30 ? 1 : 0) || [],
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Flood chart config
  const floodChartData = {
    labels: rainfallData?.dates || [],
    datasets: [
      {
        label: 'Flood Risk Days (Rain > 20mm)',
        data: rainfallData?.precipitation?.map(rain => rain > 20 ? 1 : 0) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Forecast chart configs
  const forecastOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '3 Month Forecast',
      },
    },
  };

  const heatwaveForecastData = {
    labels: forecastData.dates,
    datasets: [
      {
        label: 'Predicted Heatwave Days',
        data: forecastData.heatwaveForecast,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const floodForecastData = {
    labels: forecastData.dates,
    datasets: [
      {
        label: 'Predicted Flood Risk (mm)',
        data: forecastData.floodForecast,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Climate Disaster Dashboard</h1>
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter location"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="9">9 Months</option>
                <option value="12">1 Year</option>
              </select>
            </div>
            
            <div className="self-end">
              <button
                onClick={fetchClimateData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Highest Temperature</h3>
            {temperatureData ? (
              <p className="text-3xl font-bold text-red-600">
                {Math.max(...temperatureData.maxTemps).toFixed(1)}°C
              </p>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Lowest Temperature</h3>
            {temperatureData ? (
              <p className="text-3xl font-bold text-blue-600">
                {Math.min(...temperatureData.minTemps).toFixed(1)}°C
              </p>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Rainfall</h3>
            {rainfallData ? (
              <p className="text-3xl font-bold text-green-600">
                {rainfallData.precipitation.reduce((a, b) => a + b, 0).toFixed(1)} mm
              </p>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </motion.div>
        </div>
        
        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Temperature Trends</h2>
            <div className="h-64">
              <Line data={tempChartData} />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Rainfall Trends</h2>
            <div className="h-64">
              <Bar data={rainChartData} />
            </div>
          </motion.div>
        </div>
        
        {/* Disaster Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Heatwave Records</h2>
            <div className="h-64">
              <Bar data={heatwaveChartData} />
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Flood Risk Records</h2>
            <div className="h-64">
              <Bar data={floodChartData} />
            </div>
          </motion.div>
        </div>
        
        {/* Forecast Section */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3 Month Forecast</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2">Heatwave Forecast</h3>
            <div className="h-64">
              <Bar options={forecastOptions} data={heatwaveForecastData} />
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2">Flood Risk Forecast</h3>
            <div className="h-64">
              <Bar options={forecastOptions} data={floodForecastData} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClimateDashboard;