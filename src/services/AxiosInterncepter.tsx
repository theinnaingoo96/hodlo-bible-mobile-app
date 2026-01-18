// services/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  // baseURL: "https://api.gathengpudlo.com/api", // change to your API base URL
  baseURL: "http://163.44.197.76:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// api.interceptors.request.use(
//   (config: AxiosRequestConfig) => {
//     const token = localStorage.getItem("token"); // In React Native: use AsyncStorage
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.log("[API] error", error);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn("[API] Unauthorized");
          break;
        case 500:
          console.error("[API] Server error:", error.response.data);
          break;
      }
    } else if (error.request) {
      console.error("[API] No response received:", error.request);
    } else {
      console.error("[API] Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
