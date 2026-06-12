import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../app/routes/login';
import { useAuthStore } from '../../app/stores/useAuthStore';
import { useAppToast } from '../../app/components/ToastProvider';
import { useNavigate } from 'react-router';

// Mock React Router
vi.mock('react-router', () => ({
  Form: ({ children, onSubmit }: { children: React.ReactNode; onSubmit?: React.FormEventHandler<HTMLFormElement> }) => <form onSubmit={onSubmit}>{children}</form>,
  useNavigate: vi.fn(),
}));

// Mock Zustand Store
vi.mock('../../app/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Toast
vi.mock('../../app/components/ToastProvider', () => ({
  useAppToast: vi.fn(),
}));

describe('Login Route', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAppToast).mockReturnValue({ addToast: mockAddToast });
    vi.mocked(useAuthStore).mockImplementation((selector: (state: { login: typeof mockLogin; isLoading: boolean }) => unknown) => {
      const state = { login: mockLogin, isLoading: false };
      return selector(state);
    });
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
  });

  it('exports meta with correct title', async () => {
    const { meta } = await import('../../app/routes/login');
    const result = meta();
    expect(result).toEqual([{ title: "Iniciar Sesión - API CINE" }]);
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce(true);
    
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockAddToast).toHaveBeenCalledWith({ type: 'success', title: 'Bienvenido' });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('handles login failure (false return)', async () => {
    mockLogin.mockResolvedValueOnce(false);
    
    render(<Login />);
    
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(screen.getByText('Email o contraseña incorrectos')).toBeInTheDocument();
      expect(mockAddToast).toHaveBeenCalledWith({ type: 'error', title: 'Email o contraseña incorrectos' });
    });
  });

  it('handles login error (exception)', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network Error'));
    
    render(<Login />);
    
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(mockAddToast).toHaveBeenCalledWith({ type: 'error', title: 'Network Error' });
    });
  });

  it('handles login error (non-Error)', async () => {
    mockLogin.mockRejectedValueOnce('Some string error');
    
    render(<Login />);
    
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', () => {
    vi.mocked(useAuthStore).mockImplementation((selector: (state: { login: typeof mockLogin; isLoading: boolean }) => unknown) => {
      const state = { login: mockLogin, isLoading: true };
      return selector(state);
    });

    render(<Login />);

    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeDisabled();
    expect(screen.getByPlaceholderText('••••••••')).toBeDisabled();
  });
});
