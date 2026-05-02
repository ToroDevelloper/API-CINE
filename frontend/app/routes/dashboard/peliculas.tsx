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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Películas</h1>
          <p className="text-[#999]">Selecciona una película para reservar</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-[#999]">Cargando películas...</p>
      ) : !hasPeliculas ? (
        <p className="text-[#999]">No hay películas disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peliculas.map((p) => (
            <div
              key={p._id}
              className="bg-[#1f1f1f] border border-[#333] rounded-lg overflow-hidden hover:border-[#E50914] transition-all"
            >
              <div className="h-56 bg-[#141414]">
                {p.poster_url ? (
                  <img
                    src={p.poster_url}
                    alt={p.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#666]">
                    Sin póster
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white line-clamp-1">{p.titulo}</h2>
                  <span className="text-xs bg-[#E50914] px-2 py-1 rounded text-white font-semibold">
                    {p.clasificacion}
                  </span>
                </div>

                <p className="text-sm text-[#e9bcb6] line-clamp-3">{p.sinopsis}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#999]">{p.duracion_min} min</span>
                  <button
                    onClick={() => navigate(`/dashboard/reservas?peliculaId=${p._id}`)}
                    className="px-4 py-2 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-colors"
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
