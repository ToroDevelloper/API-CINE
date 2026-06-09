import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DashboardHome from '../../app/routes/dashboard/home';
import { getPeliculas } from '../../app/services/cineService';
import { MemoryRouter } from 'react-router';

// Mock cineService
vi.mock('../../app/services/cineService', () => ({
  getPeliculas: vi.fn(),
}));

const mockNavigate = vi.fn();

// Mock React Router
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state initially or when no movies', async () => {
    (getPeliculas as any).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay películas disponibles en este momento.')).toBeInTheDocument();
    });
  });

  it('renders peliculas and featured pelicula, and clicking navigates', async () => {
    const mockPeliculas = [
      { _id: '1', titulo: 'Peli 1', sinopsis: 'Sinopsis 1', duracion_min: 120, clasificacion: 'A', poster_url: 'img1.jpg' },
      { _id: '2', titulo: 'Peli 2', sinopsis: 'Sinopsis 2', duracion_min: 90, clasificacion: 'B' },
      { _id: '3', titulo: 'Peli 3', sinopsis: 'S3', duracion_min: 90, clasificacion: 'B' },
      { _id: '4', titulo: 'Peli 4', sinopsis: 'S4', duracion_min: 90, clasificacion: 'B' },
      { _id: '5', titulo: 'Peli 5', sinopsis: 'S5', duracion_min: 90, clasificacion: 'B' },
      { _id: '6', titulo: 'Peli 6', sinopsis: 'S6', duracion_min: 90, clasificacion: 'B' },
      { _id: '7', titulo: 'Peli 7', sinopsis: 'S7', duracion_min: 90, clasificacion: 'B' }, // 7th movie
    ];

    (getPeliculas as any).mockResolvedValueOnce(mockPeliculas);

    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Peli 1')[0]).toBeInTheDocument();
      expect(screen.getByText('Sinopsis 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Cartelera')).toBeInTheDocument();
    expect(screen.getAllByText('Peli 2')[0]).toBeInTheDocument();
    expect(screen.getByText('Más Películas')).toBeInTheDocument();
    expect(screen.getAllByText('Peli 7')[0]).toBeInTheDocument();

    // Test Navigation on click Cartelera
    const peli2Img = screen.getAllByText('Peli 2')[0].closest('.group');
    fireEvent.click(peli2Img!);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/reservas?peliculaId=2');

    // Test Navigation on click Mas Peliculas
    const peli7Img = screen.getAllByText('Peli 7')[0].closest('.group');
    fireEvent.click(peli7Img!);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/reservas?peliculaId=7');
  });

  it('handles getPeliculas error', async () => {
    (getPeliculas as any).mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay películas disponibles en este momento.')).toBeInTheDocument();
    });
  });
});
