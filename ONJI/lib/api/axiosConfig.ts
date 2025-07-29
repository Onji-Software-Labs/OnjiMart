import axios from 'axios';
import { getAccessToken } from '@/lib/secureToken';

const axiosInstance = axios.create({
  baseURL: 'https://216173960ae7.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Attach the stored access token to each request if available
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
