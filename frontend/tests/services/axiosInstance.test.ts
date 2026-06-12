import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance, { API_BASE_URL } from '../../app/services/axiosInstance';
import axios from 'axios';

interface AxiosInterceptorHandler {
  fulfilled: (response: unknown) => unknown;
  rejected: (error: unknown) => Promise<unknown>;
}

interface AxiosInterceptors {
  response: { handlers: AxiosInterceptorHandler[] };
}

function getResponseInterceptor() {
  return (axiosInstance.interceptors.response as unknown as AxiosInterceptors).handlers[0];
}

describe('axiosInstance', () => {
  const expectedBaseURL = API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { success: true } });
    localStorage.clear();
    sessionStorage.clear();
  });

  it('has correct baseURL', () => {
    expect(axiosInstance.defaults.baseURL).toBe(expectedBaseURL);
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  it('intercepts response successfully', async () => {
    const responseInterceptor = getResponseInterceptor();
    const response = { data: 'success' };
    expect(responseInterceptor.fulfilled(response)).toEqual(response);
  });

  it('intercepts error with response data', async () => {
    const responseInterceptor = getResponseInterceptor();
    const error = { response: { data: 'error data' } };
    
    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    expect(console.warn).toHaveBeenCalledWith('Error en la respuesta:', 'error data');
  });

  it('emits forbidden event for 403 responses', async () => {
    const responseInterceptor = getResponseInterceptor();
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

  it('uses fallback messages for forbidden responses without message', async () => {
    const responseInterceptor = getResponseInterceptor();
    const listener = vi.fn();
    window.addEventListener('api:forbidden', listener);

    await expect(responseInterceptor.rejected({
      response: {
        status: 403,
        data: { error: 'Rol insuficiente' },
      },
    })).rejects.toMatchObject({ response: { status: 403 } });

    await expect(responseInterceptor.rejected({
      response: {
        status: 403,
        data: 'forbidden',
      },
    })).rejects.toMatchObject({ response: { status: 403 } });

    expect(listener).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ detail: { message: 'Rol insuficiente' } })
    );
    expect(listener).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ detail: { message: 'No tienes permisos para realizar esta accion.' } })
    );
    window.removeEventListener('api:forbidden', listener);
  });

  it('does not redirect for expected auth 401 responses', async () => {
    const responseInterceptor = getResponseInterceptor();
    const listener = vi.fn();
    window.addEventListener('api:unauthorized', listener);
    localStorage.setItem('token', 'keep');

    await expect(responseInterceptor.rejected({
      config: { url: '/api/auth/login' },
      response: { status: 401, data: { message: 'Credenciales invalidas' } },
    })).rejects.toMatchObject({ response: { status: 401 } });

    await expect(responseInterceptor.rejected({
      config: { url: '/api/auth/logout' },
      response: { status: 401, data: { message: 'Sesion ya cerrada' } },
    })).rejects.toMatchObject({ response: { status: 401 } });

    await expect(responseInterceptor.rejected({
      config: { url: '/api/auth/me', skipAuthRedirect: true },
      response: { status: 401, data: { message: 'Sin sesion inicial' } },
    })).rejects.toMatchObject({ response: { status: 401 } });

    expect(listener).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('keep');
    window.removeEventListener('api:unauthorized', listener);
  });

  it('clears client state and notifies backend for 401 responses', async () => {
    const responseInterceptor = getResponseInterceptor();
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
    expect(axios.post).toHaveBeenCalledWith(`${expectedBaseURL}/api/auth/logout`, undefined, {
      withCredentials: true,
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('draft')).toBeNull();
    window.removeEventListener('api:unauthorized', listener);
  });

  it('intercepts error without response data', async () => {
    const responseInterceptor = getResponseInterceptor();
    const error = { message: 'Network error' };
    
    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    expect(console.warn).toHaveBeenCalledWith('Error desconocido:', error);
  });

  it('normalizes API urls that include /api suffix', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://backend.example.com/api/');

    const { default: instance, API_BASE_URL: configuredUrl } = await import('../../app/services/axiosInstance');

    expect(configuredUrl).toBe('https://backend.example.com/api/');
    expect(instance.defaults.baseURL).toBe('https://backend.example.com');

    vi.unstubAllEnvs();
  });
});
