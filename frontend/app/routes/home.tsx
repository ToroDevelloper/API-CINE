import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Play, Plus, Clapperboard } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";

interface Pelicula {
  _id: string;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  clasificacion: string;
  poster_url?: string;
  genero?: string[];
}

export default function Home() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [peliculaDestacada, setPeliculaDestacada] = useState<Pelicula | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    fetch("http://localhost:3000/api/peliculas")
      .then(r => r.json())
      .then(data => {
        const pelis = data.data || [];
        setPeliculas(pelis);
        if (pelis.length > 0) setPeliculaDestacada(pelis[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-bg-main text-text-main min-h-screen transition-colors duration-300">
      {/* Netflix-style Hero Banner */}
      {peliculaDestacada && (
        <section className="relative h-[85vh] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/20 to-transparent z-10" />
          
          {peliculaDestacada.poster_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 scale-105"
              style={{ backgroundImage: `url(${peliculaDestacada.poster_url})` }}
            />
          )}

          <div className="relative z-20 container mx-auto px-8 lg:px-16 pb-32 max-w-[1440px]">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-[1.1]">
              {peliculaDestacada.titulo}
            </h1>
            <p className="text-lg md:text-xl text-text-dim max-w-2xl mb-6 leading-relaxed transition-colors">
              {peliculaDestacada.sinopsis}
            </p>
            <div className="flex gap-4">
              <Link
                to={
                  isAuthenticated
                    ? `/dashboard/reservas?peliculaId=${peliculaDestacada._id}`
                    : "/login"
                }
                className="bg-primary-red hover:bg-[#F43F5E] text-white font-semibold py-3 px-8 rounded flex items-center gap-2 transition-colors text-lg"
              >
                <Plus className="w-5 h-5" />
                Reservar
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard/reservas" : "/register"}
                className="bg-bg-card/50 hover:bg-bg-card text-text-main font-semibold py-3 px-8 rounded transition-colors text-lg backdrop-blur-sm flex items-center gap-2 border border-border-base"
              >
                <Plus className="w-5 h-5" />
                Mi Lista
              </Link>
            </div>
          </div>

          {/* Gradient fade to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-main to-transparent z-10" />
        </section>
      )}

      {/* Login/Register CTA if no movies */}
      {!peliculaDestacada && (
        <section className="h-[85vh] bg-bg-main flex items-center justify-center transition-colors">
          <div className="text-center">
            <div className="mb-6">
              <Clapperboard className="w-20 h-20 text-primary-red mx-auto" />
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4 tracking-tight text-text-main">CINEMA</h1>
            <p className="text-xl md:text-2xl text-text-dim mb-8 transition-colors">Reserva de películas en línea</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-primary-red hover:bg-[#c0000c] text-white font-semibold py-3 px-8 rounded transition-colors text-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-bg-side hover:bg-bg-card text-text-main border border-border-base font-semibold py-3 px-8 rounded transition-colors text-lg"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Netflix-style Horizontal Scrolling Rows */}
      <div className="container mx-auto px-8 lg:px-16 max-w-[1440px] -mt-16 relative z-30 space-y-8 pb-16">
        {/* Trending Now */}
        {peliculas.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Cartelera</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {peliculas.map((pelicula) => (
                <div
                  key={pelicula._id}
                  className="flex-none w-[200px] md:w-[240px] group cursor-pointer"
                >
                  <div className="relative h-[300px] md:h-[360px] rounded-lg overflow-hidden bg-bg-card border border-border-base shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                    {pelicula.poster_url ? (
                      <img
                        src={pelicula.poster_url}
                        alt={pelicula.titulo}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-side to-bg-card">
                        <Clapperboard className="w-16 h-16 text-text-dim" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="font-bold text-sm md:text-base mb-1 text-white">{pelicula.titulo}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="bg-primary-red px-1.5 py-0.5 rounded text-white text-[10px] font-semibold">
                            {pelicula.clasificacion}
                          </span>
                          <span>{pelicula.duracion_min} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Continue Watching / More Movies */}
        {peliculas.length > 6 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Más Películas</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {peliculas.slice(6).map((pelicula) => (
                <div
                  key={pelicula._id}
                  className="flex-none w-[160px] md:w-[200px] group cursor-pointer"
                >
                  <div className="relative h-[240px] md:h-[300px] rounded-lg overflow-hidden bg-bg-card border border-border-base transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                    {pelicula.poster_url ? (
                      <img
                        src={pelicula.poster_url}
                        alt={pelicula.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-side to-bg-card">
                        <Clapperboard className="w-12 h-12 text-text-dim" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 w-full">
                        <p className="font-semibold text-sm text-white">{pelicula.titulo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {peliculas.length === 0 && (
          <div className="text-center py-16">
            <Clapperboard className="w-16 h-16 text-text-dim mx-auto mb-4" />
            <p className="text-text-dim text-lg">No hay películas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
