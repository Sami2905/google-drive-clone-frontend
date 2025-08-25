import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api", // Use local proxy to avoid CORS issues
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authStore = useAuthStore.getState();
        toast.loading('Refreshing session...');
        const refreshed = await authStore.refreshToken();
        toast.dismiss();
        
        if (refreshed) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
          return api(originalRequest);
        } else {
          // Token refresh failed, logout user
          authStore.logout();
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch {
        const authStore = useAuthStore.getState();
        authStore.logout();
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;


