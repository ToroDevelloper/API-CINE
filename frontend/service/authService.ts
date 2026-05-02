import axiosInstance from './axiosInstance';

export const login = async (credentials: { email: string; password: string }) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData: { name: string; email: string; password: string }) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
};

export const logout = async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
};