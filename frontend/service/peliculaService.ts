import axios from 'axios';

const API_URL = '/api/peliculas';

export const getPeliculas = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const getPelicula = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const getCartelera = async () => {
    const response = await axios.get(`${API_URL}/cartelera`);
    return response.data;
};

export const getProximosEstrenos = async () => {
    const response = await axios.get(`${API_URL}/proximos-estrenos`);
    return response.data;
};

export const createPelicula = async (data: any) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
};

export const updatePelicula = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deletePelicula = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};