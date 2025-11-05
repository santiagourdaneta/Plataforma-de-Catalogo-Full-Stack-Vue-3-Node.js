// back/src/middlewares/logTime.ts (Crea este nuevo archivo)

import { Request, Response, NextFunction } from 'express';

export const logTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Empezar el cronómetro (Registrar la hora de inicio)
    const start = process.hrtime.bigint(); 

    // 2. Esperar a que la respuesta esté lista (evento 'finish')
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        // 3. Calcular la diferencia (Tiempo total en milisegundos)
        const durationMs = (Number(end - start) / 1_000_000).toFixed(2); 

        // 4. Imprimir el resultado (¡Nuestro registro!)
        console.log(`[LOG] Ruta: ${req.method} ${req.originalUrl} | Tiempo: ${durationMs} ms`);
    });

    // Continuar con las otras partes del servidor
    next();
};