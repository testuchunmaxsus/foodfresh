import axios from "axios";

import { useAuth } from "../store/auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = useAuth.getState().refresh;
      if (refresh && !error.config._retried) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
          useAuth.getState().setTokens(data.access, refresh);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          error.config._retried = true;
          return api(error.config);
        } catch {
          useAuth.getState().logout();
        }
      } else {
        useAuth.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
