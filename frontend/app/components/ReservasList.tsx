import React, { useEffect, useState } from 'react';
import { getMisReservas } from '../services/reservaService';
import { Card, CardHeader } from './ui/Card';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';

const ReservasList: React.FC = () => {
    const [reservas, setReservas] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const data = await getMisReservas();
                setReservas(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar las reservas');
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
                {reservas.map((reserva: any) => (
                    <Card key={reserva.id} hover>
                        <CardHeader 
                            title={`Función: ${reserva.funcion}`} 
                            action={<Badge variant="success">Confirmada</Badge>}
                        />
                        <div className="mt-2">
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-gray-300">Asientos: </span> 
                                {reserva.asientos.join(', ')}
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