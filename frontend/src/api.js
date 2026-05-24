import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api")
});

api.interceptors.request.use((config) => {
  const username = localStorage.getItem("username");
  if (username) {
    config.headers["x-user-username"] = username;
  }
  return config;
});