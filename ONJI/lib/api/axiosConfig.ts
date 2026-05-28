import axios from 'axios';
import { secureStorage } from '@/lib/secureStorage';

const PUBLIC_ROUTES = [
  '/api/auth/send-otp',
  '/api/auth/login',
];

const axiosInstance = axios.create({
  baseURL: 'http://35.207.208.109:5000',
  timeout: 15000, // ⛔ important for detecting hangs
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});


// ===============================
// 🔥 REQUEST INTERCEPTOR
// ===============================
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log("\n🚀 ========== REQUEST START ==========");
    console.log("➡️ URL:", (config.baseURL || '') + config.url);
    console.log("➡️ METHOD:", config.method);
    console.log("➡️ DATA:", JSON.stringify(config.data));
    console.log("➡️ HEADERS:", config.headers);

    try {
      const isPublic = PUBLIC_ROUTES.some(route =>
        config.url?.includes(route)
      );

      console.log("🔍 IS PUBLIC ROUTE:", isPublic);

      if (!isPublic) {
        console.log("🔐 Fetching token...");

        const token = await secureStorage.getItem('token');

        console.log("🎯 TOKEN RESULT:", token);

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Authorization header added");
        } else {
          console.log("⚠️ No token found");
        }
      } else {
        console.log("🌍 Public route → skipping token");
      }

      console.log("📦 REQUEST READY\n");
      return config;

    } catch (error) {
      console.log("❌ INTERCEPTOR ERROR:", error);
      return config;
    }
  },
  (error) => {
    console.log("❌ REQUEST INTERCEPTOR FAILED:", error);
    return Promise.reject(error);
  }
);


// ===============================
// 🔥 RESPONSE INTERCEPTOR
// ===============================
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("\n📩 ========= RESPONSE SUCCESS =========");
    console.log("📊 STATUS:", response.status);
    console.log("📦 DATA:", JSON.stringify(response.data));
    console.log("=====================================\n");

    return response;
  },
  (error) => {
    console.log("\n❌ ========= RESPONSE ERROR =========");

    console.log("🔥 MESSAGE:", error.message);
    console.log("🔥 CODE:", error.code);
    console.log("🔥 STATUS:", error?.response?.status);
    console.log("🔥 DATA:", error?.response?.data);
    console.log("🔥 REQUEST:", error.request);

    console.log("=====================================\n");

    return Promise.reject(error);
  }
);

export default axiosInstance;