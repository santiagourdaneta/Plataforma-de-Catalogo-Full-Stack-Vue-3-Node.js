// back/src/routes/product.ts

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth'; 

const prisma = new PrismaClient();
const router = Router();

// RUTA PARA OBTENER PRODUCTOS CON PAGINACIÓN
// Endpoint: GET /api/products?page=1&limit=10
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        // 1. Obtener y validar parámetros de paginación
        // Aseguramos que 'page' y 'limit' sean números y tengan valores por defecto
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10; // 10 productos por página por defecto
        
        // 2. Calcular 'skip' (offset)
        const skip = (page - 1) * limit;

        // 3. Ejecutar consultas en Prisma
        const [products, totalCount] = await prisma.$transaction([
            // Consulta de los productos de la página actual
            prisma.product.findMany({
                skip: skip, // Omitir N registros
                take: limit, // Tomar N registros
                orderBy: { id: 'asc' }, 
            }),
            // Consulta para obtener el conteo total de productos (necesario para la paginación)
            prisma.product.count(),
        ]);
        
        // 4. Calcular el total de páginas
        const totalPages = Math.ceil(totalCount / limit);

        // 5. Responder con los datos paginados y metadatos
        res.json({
            products,
            meta: {
                totalCount,
                totalPages,
                currentPage: page,
                limit: limit,
            },
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al consultar el catálogo.' });
    }
});

// Puedes añadir más rutas aquí (POST, PUT, DELETE...)

export default router;