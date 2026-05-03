import axios from 'axios';

const API_URL = '/api/pagos';

export const getMisPagos = async () => {
    const response = await axios.get(`${API_URL}/mis-pagos`);
    return response.data;
};

export const createPago = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const getPago = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const solicitarReembolso = async (id: string) => {
    const response = await axios.post(`${API_URL}/${id}/reembolso`);
    return response.data;
};

export const getPagosAdmin = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const updatePago = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};
