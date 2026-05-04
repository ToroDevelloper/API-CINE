import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.data) {
      console.error("Error en la respuesta:", error.response.data);
    } else {
      console.error("Error desconocido:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
