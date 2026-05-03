import axios from 'axios';

const API_URL = '/api/funciones';

export const getFunciones = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getFuncion = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const getFuncionesPorPelicula = async (peliculaId: string) => {
    const response = await axios.get(`${API_URL}/pelicula/${peliculaId}`);
    return response.data;
};

export const createFuncion = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const updateFuncion = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteFuncion = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
