// API URL configuration for development and production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL; 