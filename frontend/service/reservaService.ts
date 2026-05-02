import axios from 'axios';

const API_URL = '/api/reservas';

export const getReservas = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getMisReservas = async () => {
    const response = await axios.get(`${API_URL}/mis-reservas`);
    return response.data;
};

export const getReserva = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createReserva = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const updateReserva = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const cancelarReserva = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getAsientosDisponibles = async (funcionId: string) => {
    const response = await axios.get(`${API_URL}/asientos-disponibles/${funcionId}`);
    return response.data;
};