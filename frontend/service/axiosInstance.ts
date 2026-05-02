import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // Cambiar al dominio del backend si es necesario
    withCredentials: true, // Permite el envío de cookies y credenciales
});

// Interceptor para manejar errores globales
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejo de errores globales
        if (error.response) {
            console.error('Error en la respuesta:', error.response.data);
        } else {
            console.error('Error desconocido:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;