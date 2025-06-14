import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API configuration (can be in a separate file)
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const RcaMonitorAnalyzer = () => {
  // State management
  const [monitors, setMonitors] = useState([]);
  const [selectedMonitor, setSelectedMonitor] = useState('');
  const [rcaData, setRcaData] = useState(null);
  const [loading, setLoading] = useState({
    monitors: false,
    rca: false
  });
  const [error, setError] = useState({
    monitors: '',
    rca: ''
  });

  // Fetch monitors on component mount
  useEffect(() => {
    const fetchMonitors = async () => {
      setLoading(prev => ({ ...prev, monitors: true }));
      setError(prev => ({ ...prev, monitors: '' }));
      
      try {
        const response = await API.get('/get-monitors');
        setMonitors(response.data);
      } catch (err) {
        setError(prev => ({ 
          ...prev, 
          monitors: err.response?.data?.message || 'Failed to load monitors' 
        }));
        console.error('Monitor fetch error:', err);
      } finally {
        setLoading(prev => ({ ...prev, monitors: false }));
      }
    };

    fetchMonitors();
  }, []);

  // Handle RCA data fetch
  const fetchRcaData = async () => {
    if (!selectedMonitor) return;
    
    setLoading(prev => ({ ...prev, rca: true }));
    setError(prev => ({ ...prev, rca: '' }));
    setRcaData(null);
    
    try {
      const response = await API.get(`/get-rca-data?monitorId=${selectedMonitor}`);
      setRcaData(response.data);
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        rca: err.response?.data?.error || 'Failed to fetch RCA data' 
      }));
      console.error('RCA fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, rca: false }));
    }
  };

  // Format RCA data for display
  const formatRcaData = (data) => {
    if (!data) return null;
    
    try {
      if (typeof data === 'string') {
        return data;
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Unable to format RCA data';
    }
  };

  return (
    <div className="rca-monitor-container p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Monitor RCA Analyzer</h1>
      
      {/* Monitor Selection */}
      <div className="mb-6">
        <label htmlFor="monitor-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Monitor
        </label>
        <div className="flex gap-2">
          <select
            id="monitor-select"
            value={selectedMonitor}
            onChange={(e) => setSelectedMonitor(e.target.value)}
            disabled={loading.monitors}
            className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{loading.monitors ? 'Loading monitors...' : 'Select a monitor'}</option>
            {monitors.map((monitor) => (
              <option 
                key={monitor.monitor_id} 
                value={monitor.monitor_id}
              >
                {monitor.monitor_name} (ID: {monitor.monitor_id})
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchRcaData}
            disabled={!selectedMonitor || loading.rca}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.rca ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : 'Analyze'}
          </button>
        </div>
        {error.monitors && (
          <p className="mt-2 text-sm text-red-600">{error.monitors}</p>
        )}
      </div>

      {/* Error Display */}
      {error.rca && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error fetching RCA data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.rca}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {rcaData && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              RCA Analysis Results
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed root cause analysis for selected monitor
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="sm:divide-y sm:divide-gray-200">
              <pre className="p-4 overflow-x-auto text-sm text-gray-800 bg-gray-50">
                {formatRcaData(rcaData)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RcaMonitorAnalyzer;