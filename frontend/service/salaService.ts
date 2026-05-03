import axios from 'axios';

const API_URL = '/api/salas';

export const getSalas = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getSala = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createSala = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const updateSala = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteSala = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
