import React, { useState } from 'react';
import { login, register } from '../service/authService';
import { Card, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

const AuthForm: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
                alert('Login exitoso');
            } else {
                await register({ name: formData.name, email: formData.email, password: formData.password });
                alert('Registro exitoso');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader title={isLogin ? 'Iniciar Sesión' : 'Registrarse'} />
                
                <div className="mt-4">
                    {error && (
                        <Alert type="error" className="mb-4">
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                type="text"
                                name="name"
                                label="Nombre"
                                placeholder="Tu nombre"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        )}
                        <Input
                            type="email"
                            name="email"
                            label="Correo Electrónico"
                            placeholder="ejemplo@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            type="password"
                            name="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        
                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AuthForm;