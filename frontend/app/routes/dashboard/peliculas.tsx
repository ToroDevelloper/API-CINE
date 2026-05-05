import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getPeliculas, type Pelicula } from "../../services/cineService";

export default function Peliculas() {
  const navigate = useNavigate();
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPeliculas();
        if (!alive) return;
        setPeliculas(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando películas");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const hasPeliculas = useMemo(() => peliculas.length > 0, [peliculas.length]);

  return (
    <div className="p-6 bg-bg-main min-h-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main transition-colors">Películas</h1>
          <p className="text-text-dim transition-colors">Selecciona una película para reservar</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-dim transition-colors">Cargando películas...</p>
      ) : !hasPeliculas ? (
        <p className="text-text-dim transition-colors">No hay películas disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peliculas.map((p) => (
            <div
              key={p._id}
              className="bg-bg-card border border-border-base rounded-lg overflow-hidden hover:border-primary-red transition-all duration-300"
            >
              <div className="h-56 bg-bg-side transition-colors">
                {p.poster_url ? (
                  <img
                    src={p.poster_url}
                    alt={p.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-dim transition-colors">
                    Sin póster
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-text-main line-clamp-1 transition-colors">{p.titulo}</h2>
                  <span className="text-xs bg-primary-red px-2 py-1 rounded text-white font-semibold">
                    {p.clasificacion}
                  </span>
                </div>

                <p className="text-sm text-text-dim line-clamp-3 transition-colors">{p.sinopsis}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-dim transition-colors">{p.duracion_min} min</span>
                  <button
                    onClick={() => navigate(`/dashboard/reservas?peliculaId=${p._id}`)}
                    className="px-4 py-2 bg-primary-red hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
