import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'json' && typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);