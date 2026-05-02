import React, { useEffect, useState } from 'react';
import { getPeliculas } from '../service/peliculaService';

const PeliculasList: React.FC = () => {
    const [peliculas, setPeliculas] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPeliculas = async () => {
            try {
                const data = await getPeliculas();
                setPeliculas(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar las películas');
            }
        };
        fetchPeliculas();
    }, []);

    return (
        <div className="peliculas-list">
            <h2>Películas</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {peliculas.map((pelicula: any) => (
                    <li key={pelicula.id}>
                        <h3>{pelicula.titulo}</h3>
                        <p>{pelicula.sinopsis}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PeliculasList;