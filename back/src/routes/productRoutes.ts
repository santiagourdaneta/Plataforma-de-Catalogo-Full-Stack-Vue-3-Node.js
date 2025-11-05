import { Router, Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { poolMySQL } from '../db/database';

const router = Router();

// Endpoint para el listado de productos con paginación
router.get('/products', async (req: Request, res: Response) => {
    // 1. Obtener parámetros y definir valores por defecto
    // Si no se envía 'page', se asume 1. Si no se envía 'limit', se asume 10.
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit; 
    
    // El query de búsqueda es opcional
    const searchQuery = (req.query.search as string) || ''; 
    
    let connection;
    try {
        connection = await poolMySQL.getConnection();

        // 2. CONTEO TOTAL: Necesario para la paginación
        // Contamos el total de filas, aplicando el filtro de búsqueda si existe.
        const countQuery = `
            SELECT COUNT(*) as total
            FROM product
            WHERE name LIKE ? OR description OR price LIKE ?
        `;
        const searchPattern = `%${searchQuery}%`;
        const [countRows] = await connection.execute<RowDataPacket[]>(countQuery, [searchPattern, searchPattern]);
        const totalItems = countRows[0].total;

        // 3. CONSULTA DE DATOS: Obtener solo la página actual
        const dataQuery = `
            SELECT id, name, price
            FROM product
            WHERE name LIKE ? OR description LIKE ? OR price LIKE ?
            LIMIT ? OFFSET ?
        `;
        const dataParams: (string | number)[] = [searchPattern, searchPattern, limit, offset];
        const [productos] = await connection.execute<RowDataPacket[]>(dataQuery, dataParams);
        
        // 4. Calcular el total de páginas
        const totalPages = Math.ceil(totalItems / limit);

        // 5. RESPUESTA
        res.status(200).json({
            products: productos,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

export default router;