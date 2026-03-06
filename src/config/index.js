module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET || 'clave_por_defecto',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    }
};
