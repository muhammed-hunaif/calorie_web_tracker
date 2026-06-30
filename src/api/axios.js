import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor:
api.interceptors.request.use(
  (config) => {
    console.log("axios config", config.baseURL);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor:
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/Login';
    }
    return Promise.reject(error);
  }
);

export default api;
