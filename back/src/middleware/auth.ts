// back/src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request de Express para añadir el campo 'userId'
// Esto permite que las rutas sepan qué usuario está autenticado.
interface AuthRequest extends Request {
    userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Obtener el token del encabezado
    const authHeader = req.header('Authorization');
    
    // El formato esperado es "Bearer TOKEN"
    const token = authHeader?.split(' ')[1];

    // 2. Verificar si el token existe
    if (!token) {
        return res.status(401).json({ 
            message: 'Acceso denegado. Se requiere un token de autenticación.' 
        });
    }

    console.log('JWT_SECRET usado para verificación:', process.env.JWT_SECRET);

    // 3. Verificar si JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
        // Esto debería manejarse al inicio del servidor, pero es una buena práctica aquí también.
        console.error("JWT_SECRET no está configurado.");
        return res.status(500).json({ message: 'Error de configuración del servidor.' });
    }

    try {
        // 4. Decodificar y verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number, email: string };
        
        // 5. Adjuntar el ID del usuario a la solicitud para uso posterior en las rutas
        req.userId = decoded.id; 
        
        // 6. Si es válido, pasar al siguiente middleware/ruta
        next();

    } catch (error) {
        // Si el token es inválido, expiró o está malformado
        return res.status(403).json({ 
            message: 'Token inválido o expirado. Vuelve a iniciar sesión.' 
        });
    }
};