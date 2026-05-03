import axios from 'axios';

const API_URL = '/api/pedidos';

export const getMisPedidos = async () => {
    const response = await axios.get(`${API_URL}/mis-pedidos`);
    return response.data;
};

export const createPedido = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const getPedido = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const cancelarPedido = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getPedidosAdmin = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const updatePedido = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};
