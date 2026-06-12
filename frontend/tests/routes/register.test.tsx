import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Register, { action } from '../../app/routes/register';
import { register as apiRegister } from '../../app/services/authService';

// Mock authService
vi.mock('../../app/services/authService', () => ({
  register: vi.fn(),
}));

// Mock React Router
vi.mock('react-router', () => ({
  Form: ({ children, className }: { children: React.ReactNode; className?: string }) => <form className={className}>{children}</form>,
  useActionData: vi.fn(),
  useNavigation: vi.fn(() => ({ state: 'idle' })),
  useNavigate: vi.fn(() => vi.fn()),
}));

import { useActionData, useNavigation, useNavigate } from 'react-router';

describe('Register Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useActionData).mockReturnValue(null);
    vi.mocked(useNavigation).mockReturnValue({ state: 'idle' });
  });

  it('renders register form', () => {
    render(<Register />);
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument();
  });

  it('renders with error action data', () => {
    vi.mocked(useActionData).mockReturnValue({ error: 'Email ya registrado' });
    render(<Register />);
    expect(screen.getByText('Email ya registrado')).toBeInTheDocument();
  });

  it('renders with success action data and redirects', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.useFakeTimers();

    vi.mocked(useActionData).mockReturnValue({ success: true, message: 'Registro exitoso' });
    render(<Register />);
    
    expect(screen.getByText('Registro exitoso')).toBeInTheDocument();
    
    vi.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    vi.useRealTimers();
  });

  it('shows submitting state', () => {
    vi.mocked(useNavigation).mockReturnValue({ state: 'submitting' });
    render(<Register />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Registrando...');
  });
});

describe('Register action', () => {
  it('handles successful registration', async () => {
    vi.mocked(apiRegister).mockResolvedValueOnce(true);
    
    const formData = new FormData();
    formData.append('email', 'test@test.com');
    formData.append('password', '123456');
    formData.append('nombre', 'Juan');
    formData.append('apellido', 'Perez');
    
    const request = new Request('http://localhost/register', { method: 'POST', body: formData });
    
    const result = await action({ request } as { request: Request });
    expect(result).toEqual({ success: true, message: 'Registro exitoso. Redirigiendo...' });
  });

  it('handles failed registration', async () => {
    vi.mocked(apiRegister).mockRejectedValueOnce(new Error('Invalid email'));
    
    const formData = new FormData();
    formData.append('email', 'test@test.com');
    formData.append('password', '123456');
    formData.append('nombre', 'Juan');
    formData.append('apellido', 'Perez');
    
    const request = new Request('http://localhost/register', { method: 'POST', body: formData });
    
    const result = await action({ request } as { request: Request });
    expect(result).toEqual({ error: 'Invalid email' });
  });

  it('handles failed registration with non-Error values', async () => {
    vi.mocked(apiRegister).mockRejectedValueOnce('network down');

    const formData = new FormData();
    formData.append('email', 'test@test.com');
    formData.append('password', '123456');
    formData.append('nombre', 'Juan');
    formData.append('apellido', 'Perez');

    const request = new Request('http://localhost/register', { method: 'POST', body: formData });

    const result = await action({ request } as { request: Request });
    expect(result).toEqual({ error: 'Error de conexión con el servidor' });
  });
});
