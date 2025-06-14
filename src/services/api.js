import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
API.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out';
    }
    return Promise.reject(error);
  }
);

export const api = {
  getMetrics: () => API.get('/get-metrics'),
  getAlarms: () => API.get('/get-alarms'),
  createMonitor: (data) => API.post('/create-monitor', data),
  getMonitors: () => API.get('/get-monitors'),
  createMonitorGroup: (data) => API.post('/create-group', data),
  getMonitorDetails: (monitorId) => API.get(`/get-monitor-details?monitorId=${monitorId}`)
};