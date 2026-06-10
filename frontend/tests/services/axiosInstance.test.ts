import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../../app/services/axiosInstance';
import axios from 'axios';

describe('axiosInstance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { success: true } });
    localStorage.clear();
    sessionStorage.clear();
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

  it('emits forbidden event for 403 responses', async () => {
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const listener = vi.fn();
    window.addEventListener('api:forbidden', listener);

    const error = {
      response: {
        status: 403,
        data: { message: 'Sin permisos' },
      },
    };

    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ message: 'Sin permisos' });
    window.removeEventListener('api:forbidden', listener);
  });

  it('clears client state and notifies backend for 401 responses', async () => {
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const listener = vi.fn();
    window.addEventListener('api:unauthorized', listener);
    localStorage.setItem('token', 'stale');
    sessionStorage.setItem('draft', 'stale');

    const error = {
      config: { url: '/api/auth/me' },
      response: {
        status: 401,
        data: { message: 'Sesion invalida' },
      },
    };

    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ message: 'Sesion invalida' });
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/api/auth/logout', undefined, {
      withCredentials: true,
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('draft')).toBeNull();
    window.removeEventListener('api:unauthorized', listener);
  });

  it('intercepts error without response data', async () => {
    const responseInterceptor = (axiosInstance.interceptors.response as any).handlers[0];
    const error = { message: 'Network error' };
    
    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    expect(console.warn).toHaveBeenCalledWith('Error desconocido:', error);
  });
});
