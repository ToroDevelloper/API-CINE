import React, { useEffect, useState } from 'react';
import { getPeliculas, type Pelicula } from '../services/peliculaService';
import { Card, CardHeader } from './ui/Card';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

const PeliculasList: React.FC = () => {
    const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
    const [error, setError] = useState('');
    const [selectedPelicula, setSelectedPelicula] = useState<any>(null);

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
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Películas Disponibles</h2>
            
            {error && (
                <Alert type="error" className="mb-6">
                    {error}
                </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peliculas.map((pelicula: any) => (
                    <div key={pelicula.id} onClick={() => setSelectedPelicula(pelicula)} className="cursor-pointer">
                        <Card hover>
                            <CardHeader 
                                title={pelicula.titulo} 
                                action={
                                    <Badge variant="primary">
                                        {pelicula.genero || 'Estreno'}
                                    </Badge>
                                }
                            />
                            <div className="mt-2 text-gray-400 text-sm line-clamp-3">
                                <p>{pelicula.sinopsis}</p>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
            
            {peliculas.length === 0 && !error && (
                <div className="text-center py-10 text-gray-500">
                    <p>No hay películas disponibles en este momento.</p>
                </div>
            )}

            {/* Modal para ver detalles de la película */}
            <Modal 
                isOpen={!!selectedPelicula} 
                onClose={() => setSelectedPelicula(null)}
                title="Detalles de la Película"
            >
                {selectedPelicula && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">{selectedPelicula.titulo}</h3>
                            <Badge variant="primary">{selectedPelicula.genero || 'Estreno'}</Badge>
                        </div>
                        <p className="text-gray-300">{selectedPelicula.sinopsis}</p>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setSelectedPelicula(null)}>
                                Cerrar
                            </Button>
                            <Button variant="primary" onClick={() => alert('Función de reserva en construcción')}>
                                Reservar Entrada
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PeliculasList;