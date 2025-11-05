// src/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Definición del Rate Limiter para el Login
// Es crucial configurarlo de manera estricta para el login
export const loginLimiter = rateLimit({
    // 1. Configuración de tiempo: 15 minutos (en milisegundos)
    windowMs: 15 * 60 * 1000, 
    
    // 2. Límite de peticiones: Máximo 5 intentos por ventana (por IP)
    max: 5, 
    
    // 3. Incluir headers estándar (ayuda con proxies)
    standardHeaders: true, 
    
    // 4. Mensaje de error cuando se excede el límite
    message: async (req: Request, res: Response) => {
        // Usamos un status 429 (Too Many Requests) para indicar Rate Limiting
        res.status(429).json({
            error: "Demasiados intentos de inicio de sesión fallidos desde esta IP. Por favor, intenta de nuevo en 15 minutos."
        });
    },
});

// Limitador más general para otras rutas
export const generalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100, // Límite de 100 peticiones por hora por IP
    message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de una hora."
});