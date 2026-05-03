import axios from 'axios';

const API_URL = '/api/snacks';

export const getSnacks = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getSnacksPorCategoria = async (categoria: string) => {
    const response = await axios.get(`${API_URL}/categoria/${categoria}`);
    return response.data;
};

export const getSnack = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createSnack = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const updateSnack = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteSnack = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
