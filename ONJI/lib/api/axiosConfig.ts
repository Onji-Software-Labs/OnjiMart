import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// const token = 'eyJhbGciOiJIUzUxMiJ9.eyJwaG9uZU51bWJlciI6Iis5MTk4NzY1NDMyMTEiLCJ1c2VySWQiOiJlNDE4MmNkNy1iZWMyLTRjYWUtYTVjZS03NDRmNDQzZTgyZWUiLCJzdWIiOiIrOTE5ODc2NTQzMjExIiwiaWF0IjoxNzcwMzc0MjkxLCJleHAiOjE3NzI5NjYyOTF9.t3G4h6zt4wVrQH-R0m2WFc8wV5IqyxpAt9_mkbNVVZnyOueZ2mvK0JeIHgVb4kytpZNpL5LlE9HIRKY6FfuHag'; // paste the token you got from Postman

const axiosInstance = axios.create({
  baseURL: 'http://35.207.244.30:5000', 
  headers: {

    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    // Authorization: `Bearer ${token}`, // attach the token here

  },

});

// Optional: Add interceptors (e.g., auth tokens)
axiosInstance.interceptors.request.use(
  async (config) => {
    // You can inject tokens here if needed (e.g. using AsyncStorage or SecureStore)
     const token = await AsyncStorage.getItem('token');
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
