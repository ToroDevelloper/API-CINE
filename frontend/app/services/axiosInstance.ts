import axios, { type AxiosError } from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
const baseURL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl.slice(0, -"/api".length)
  : normalizedBaseUrl;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.data) {
      console.warn("Error en la respuesta:", error.response.data);
    } else {
      console.warn("Error desconocido:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
