import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../../app/services/axiosInstance';
import axios from 'axios';

describe('axiosInstance', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('has correct baseURL', () => {
    expect(axiosInstance.defaults.baseURL).toBe('http://localhost:3000');
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  it('intercepts response successfully', async () => {
    // Interceptors in axios return the response for a fulfilled promise
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const response = { data: 'success' };
    expect(responseInterceptor.fulfilled(response)).toEqual(response);
  });

  it('intercepts error with response data', async () => {
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const error = { response: { data: 'error data' } };
    
    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    expect(console.warn).toHaveBeenCalledWith('Error en la respuesta:', 'error data');
  });

  it('intercepts error without response data', async () => {
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const error = { message: 'Network error' };
    
    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    expect(console.warn).toHaveBeenCalledWith('Error desconocido:', error);
  });
});
