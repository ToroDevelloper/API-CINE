import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../../app/routes/home';
import { MemoryRouter } from 'react-router';
import { useAuthStore } from '../../app/stores/useAuthStore';
import { getPeliculas } from '../../app/services/peliculaService';

// Mock Zustand
vi.mock('../../app/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../app/services/peliculaService', () => ({
  getPeliculas: vi.fn(),
}));

describe('Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector: (state: { isAuthenticated: boolean }) => unknown) => selector({ isAuthenticated: false }));
  });

  it('renders loading state/empty state initially', async () => {
    vi.mocked(getPeliculas).mockResolvedValueOnce([]);

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
      { _id: '2', titulo: 'Pelicula 2', sinopsis: 'Sinopsis 2', duracion_min: 90, clasificacion: 'B' },
      { _id: '3', titulo: 'Pelicula 3', sinopsis: 'Sinopsis 3', duracion_min: 90, clasificacion: 'B' },
      { _id: '4', titulo: 'Pelicula 4', sinopsis: 'Sinopsis 4', duracion_min: 90, clasificacion: 'B' },
      { _id: '5', titulo: 'Pelicula 5', sinopsis: 'Sinopsis 5', duracion_min: 90, clasificacion: 'B' },
      { _id: '6', titulo: 'Pelicula 6', sinopsis: 'Sinopsis 6', duracion_min: 90, clasificacion: 'B' },
      { _id: '7', titulo: 'Pelicula 7', sinopsis: 'Sinopsis 7', duracion_min: 90, clasificacion: 'B' },
      { _id: '8', titulo: 'Pelicula 8', sinopsis: 'Sinopsis 8', duracion_min: 90, clasificacion: 'B', poster_url: 'img8.jpg' },
    ];

    vi.mocked(getPeliculas).mockResolvedValueOnce(mockPeliculas);

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
    vi.mocked(useAuthStore).mockImplementation((selector: (state: { isAuthenticated: boolean }) => unknown) => selector({ isAuthenticated: true }));
    
    const mockPeliculas = [
      { _id: '1', titulo: 'Pelicula 1', sinopsis: 'Sinopsis 1', duracion_min: 120, clasificacion: 'A' }
    ];

    vi.mocked(getPeliculas).mockResolvedValueOnce(mockPeliculas);

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

  it('keeps empty state when peliculas request fails', async () => {
    vi.mocked(getPeliculas).mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay películas disponibles en este momento.')).toBeInTheDocument();
    });
  });
});
