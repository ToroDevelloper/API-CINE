import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../../app/routes/home';
import { MemoryRouter } from 'react-router';
import { useAuthStore } from '../../app/stores/useAuthStore';

// Mock Zustand
vi.mock('../../app/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    (useAuthStore as any).mockImplementation((selector: any) => selector({ isAuthenticated: false }));
  });

  it('renders loading state/empty state initially', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ data: [] })
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('CINEMA')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('No hay películas disponibles en este momento.')).toBeInTheDocument();
    });
  });

  it('renders peliculas and featured pelicula', async () => {
    const mockPeliculas = [
      { _id: '1', titulo: 'Pelicula 1', sinopsis: 'Sinopsis 1', duracion_min: 120, clasificacion: 'A', poster_url: 'img1.jpg' },
      { _id: '2', titulo: 'Pelicula 2', sinopsis: 'Sinopsis 2', duracion_min: 90, clasificacion: 'B' }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ data: mockPeliculas })
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Featured pelicula
    await waitFor(() => {
      expect(screen.getAllByText('Pelicula 1')[0]).toBeInTheDocument();
      expect(screen.getByText('Sinopsis 1')).toBeInTheDocument();
    });

    // Cartelera
    expect(screen.getByText('Cartelera')).toBeInTheDocument();
    expect(screen.getByText('Pelicula 2')).toBeInTheDocument();
  });

  it('changes links when authenticated', async () => {
    (useAuthStore as any).mockImplementation((selector: any) => selector({ isAuthenticated: true }));
    
    const mockPeliculas = [
      { _id: '1', titulo: 'Pelicula 1', sinopsis: 'Sinopsis 1', duracion_min: 120, clasificacion: 'A' }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ data: mockPeliculas })
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeInTheDocument();
      // Should point to dashboard instead of login
      expect(screen.getByText('Reservar').closest('a')).toHaveAttribute('href', '/dashboard/reservas?peliculaId=1');
    });
  });
});
