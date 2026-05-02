import axios from 'axios';

const API_URL = '/api/usuarios';

export const getUsuarios = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getUsuario = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const updateUsuario = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteUsuario = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};