import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../../app/services/apiClient';
import axiosInstance from '../../app/services/axiosInstance';

vi.mock('../../app/services/axiosInstance');

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs GET request successfully', async () => {
    vi.mocked(axiosInstance.request).mockResolvedValueOnce({ data: { success: true } });
    
    const result = await apiFetch('/test');
    
    expect(axiosInstance.request).toHaveBeenCalledWith({
      url: '/test',
      method: 'GET',
      headers: undefined,
      params: undefined
    });
    expect(result).toEqual({ success: true });
  });

  it('performs POST request with json', async () => {
    vi.mocked(axiosInstance.request).mockResolvedValueOnce({ data: { success: true } });
    
    await apiFetch('/test', { method: 'POST', json: { foo: 'bar' } });
    
    expect(axiosInstance.request).toHaveBeenCalledWith({
      url: '/test',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      params: undefined,
      data: { foo: 'bar' }
    });
  });

  it('performs request with body', async () => {
    vi.mocked(axiosInstance.request).mockResolvedValueOnce({ data: { success: true } });
    
    const body = new FormData();
    await apiFetch('/test', { method: 'PUT', body });
    
    expect(axiosInstance.request).toHaveBeenCalledWith({
      url: '/test',
      method: 'PUT',
      headers: undefined,
      params: undefined,
      data: body
    });
  });

  it('throws mapped error from response', async () => {
    vi.mocked(axiosInstance.request).mockRejectedValueOnce({
      response: { data: { message: 'Custom error' } }
    });
    
    await expect(apiFetch('/test')).rejects.toThrow('Custom error');
  });

  it('throws mapped error from network failure', async () => {
    vi.mocked(axiosInstance.request).mockRejectedValueOnce({
      message: 'Network failure'
    });
    
    await expect(apiFetch('/test')).rejects.toThrow('Network failure');
  });

  it('throws fallback error', async () => {
    vi.mocked(axiosInstance.request).mockRejectedValueOnce({});
    
    await expect(apiFetch('/test')).rejects.toThrow('Error de red');
  });
});
