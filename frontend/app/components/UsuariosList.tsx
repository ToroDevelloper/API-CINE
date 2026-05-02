import React, { useEffect, useState } from 'react';
import { getUsuarios } from '../service/usuarioService';

const UsuariosList: React.FC = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const data = await getUsuarios();
                setUsuarios(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar los usuarios');
            }
        };
        fetchUsuarios();
    }, []);

    return (
        <div className="usuarios-list">
            <h2>Usuarios</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {usuarios.map((usuario: any) => (
                    <li key={usuario.id}>
                        <h3>{usuario.name}</h3>
                        <p>Email: {usuario.email}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsuariosList;