import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../app/stores/useAuthStore';
import * as apiClient from '../../app/services/apiClient';
import { useCartStore } from '../../app/stores/useCartStore';

vi.mock('../../app/services/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useCartStore.setState({ items: [], total: 0 });
  });

  it('init - success', async () => {
    const mockUser = { _id: '1', nombre: 'Test', email: 'test@test.com' };
    vi.mocked(apiClient.apiFetch).mockResolvedValueOnce({ success: true, data: mockUser });

    await useAuthStore.getState().init();

    expect(apiClient.apiFetch).toHaveBeenCalledWith('/api/auth/me');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('init - failure', async () => {
    vi.mocked(apiClient.apiFetch).mockRejectedValueOnce(new Error('Network error'));

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login - success', async () => {
    const mockUser = { _id: '1', nombre: 'Test', email: 'test@test.com' };
    vi.mocked(apiClient.apiFetch).mockResolvedValueOnce({ success: true, data: mockUser });

    const result = await useAuthStore.getState().login('test@test.com', 'password');

    expect(result).toBe(true);
    expect(apiClient.apiFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      json: { email: 'test@test.com', password: 'password' },
    });
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('login - failure', async () => {
    vi.mocked(apiClient.apiFetch).mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(useAuthStore.getState().login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout', async () => {
    useAuthStore.setState({ user: { _id: '1', nombre: 'Test', email: 'test@test.com' }, isAuthenticated: true });
    vi.mocked(apiClient.apiFetch).mockResolvedValueOnce({ success: true });

    await useAuthStore.getState().logout();

    expect(apiClient.apiFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('init with null response', async () => {
    vi.mocked(apiClient.apiFetch).mockResolvedValueOnce(null as any);
    await useAuthStore.getState().init();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('login with null response', async () => {
    vi.mocked(apiClient.apiFetch).mockResolvedValueOnce({ data: null as any } as any);
    const result = await useAuthStore.getState().login('test@test.com', '123456');
    expect(result).toBe(false);
  });

  it('logout ignores errors', async () => {
    vi.mocked(apiClient.apiFetch).mockRejectedValueOnce(new Error('fail'));
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
