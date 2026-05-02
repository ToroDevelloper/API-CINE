import React, { useEffect, useState } from 'react';
import { getMisReservas } from '../service/reservaService';

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
        <div className="reservas-list">
            <h2>Mis Reservas</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {reservas.map((reserva: any) => (
                    <li key={reserva.id}>
                        <h3>Reserva para: {reserva.funcion}</h3>
                        <p>Asientos: {reserva.asientos.join(', ')}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReservasList;