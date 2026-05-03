import React, { useEffect, useState } from 'react';
import { getUsuarios } from '../service/usuarioService';
import { Card } from './ui/Card';
import { Alert } from './ui/Alert';
import { Avatar } from './ui/Avatar';
import { Tooltip } from './ui/Tooltip';

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
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Directorio de Usuarios</h2>
            
            {error && (
                <Alert type="error" className="mb-6">
                    {error}
                </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuarios.map((usuario: any) => (
                    <Card key={usuario.id} hover className="flex items-center gap-4">
                        <Tooltip content={`Usuario ID: ${usuario.id}`}>
                            <div>
                                <Avatar fallback={usuario.name || 'U'} size="lg" />
                            </div>
                        </Tooltip>
                        <div>
                            <h3 className="text-lg font-bold text-white">{usuario.name}</h3>
                            <p className="text-sm text-gray-400">{usuario.email}</p>
                        </div>
                    </Card>
                ))}
            </div>
            
            {usuarios.length === 0 && !error && (
                <div className="text-center py-10 text-gray-500">
                    <p>No se encontraron usuarios.</p>
                </div>
            )}
        </div>
    );
};

export default UsuariosList;