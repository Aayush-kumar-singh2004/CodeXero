// API configuration for both development and production
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export const getServerUrl = () => {
  return import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  serverURL: getServerUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
};