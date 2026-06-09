import React, { useEffect, useState } from 'react';
import { getMisReservas, type Reserva } from '../services/reservaService';
import { Card, CardHeader } from './ui/Card';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';

const ReservasList: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const data = await getMisReservas();
                setReservas(data);
            } catch (err: unknown) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Error al cargar las reservas');
            }
        };
        fetchReservas();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mis Reservas</h2>
            
            {error && (
                <Alert type="error" className="mb-6">
                    {error}
                </Alert>
            )}
            
            <div className="space-y-4">
                {reservas.map((reserva: Reserva) => (
                    <Card key={reserva._id} hover>
                        <CardHeader 
                            title={`Función: ${reserva.funcion_id?.pelicula_id && typeof reserva.funcion_id.pelicula_id === 'object' ? reserva.funcion_id.pelicula_id.titulo : 'Reserva'}`} 
                            action={<Badge variant="success">Confirmada</Badge>}
                        />
                        <div className="mt-2">
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-gray-300">Asientos: </span> 
                                {reserva.asientos_ids?.map((a: { fila: string; numero: number }) => `${a.fila}${a.numero}`).join(', ') || '—'}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
            
            {reservas.length === 0 && !error && (
                <div className="text-center py-10 text-gray-500 bg-gray-900 rounded-xl border border-gray-800 mt-4">
                    <p>Aún no tienes reservas realizadas.</p>
                </div>
            )}
        </div>
    );
};

export default ReservasList;