import axios from 'axios';

const API_URL = '/api/asientos';

export const getAsientosPorSala = async (salaId: string) => {
    const response = await axios.get(`${API_URL}/sala/${salaId}`);
    return response.data;
};

export const getAsiento = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createAsiento = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const createAsientosBulk = async (data: any) => {
    const response = await axios.post(`${API_URL}/bulk`, data);
    return response.data;
};

export const updateAsiento = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteAsiento = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
