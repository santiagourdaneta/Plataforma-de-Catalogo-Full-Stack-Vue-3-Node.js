// src/server.ts 
require('dotenv').config();
import express from 'express'; 
import mysql, { Pool, RowDataPacket, FieldPacket } from 'mysql2/promise';
import cors from 'cors';
import authRouter from './routes/authRoutes';
import { poolMySQL } from './db/database';

const app = express();
const PORT = 3000;

// Middleware CORS usando la librería
app.use(cors({
    // Permite solo el origen de tu frontend Vue
    origin: 'http://localhost:5173', 
    // Asegura que las credenciales (si usas cookies/tokens) sean aceptadas
    credentials: true, 
    // Define los métodos que se permiten (GET, POST, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Middleware para procesar JSON (mantener)
app.use(express.json());

const router = express.Router();

app.use('/api/auth', authRouter);

module.exports = router;

// RUTA PRINCIPAL DE BÚSQUEDA Y CATÁLOGO
app.get('/api/buscador', async (req, res) => {
    // 1. Manejo de Parámetros de Paginación y Búsqueda
    const rawQuery = req.query.query;
    let terminoBusqueda: string = '';
    // Type check for query parameter: must be string and non-empty
    if (typeof rawQuery === 'string') {
        terminoBusqueda = rawQuery;
    } else if (typeof rawQuery !== 'undefined') {
        // If provided but not a string (e.g., array, object), reject
        return res.status(400).json({ error: 'Formato de parámetro query inválido.' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; 
    const offset = (page - 1) * limit; // Fórmula clave: (página - 1) * límite

    // 🛡️ VALIDACIÓN (El Guardián)
    if (terminoBusqueda.length > 0 && terminoBusqueda.length < 3) {
        return res.status(400).json({ error: "Término de búsqueda muy corto (mínimo 3 letras)." });
    }

    // --- CONSTRUCCIÓN DE LA CONSULTA SQL ---
    
    let whereClause = '';
    // Los parámetros serán dinámicos dependiendo si hay búsqueda o no.
    let searchParams: (string | number)[] = []; 
    
    if (terminoBusqueda) {
        // Usamos FULLTEXT para búsquedas específicas
        whereClause = 'WHERE MATCH(name, description, price) AGAINST(? IN BOOLEAN MODE)';
        searchParams.push(terminoBusqueda);
    } 
    // Si no hay término, whereClause queda vacío para traer todo el catálogo.

    try {
        // 2. CONSULTA 1: OBTENER EL TOTAL DE REGISTROS (Para la paginación)
        const countQuery = `SELECT COUNT(*) AS total FROM product ${whereClause}`;
        const [countRows] = await poolMySQL.execute(countQuery, searchParams);
        
        // Usamos as any para manejar el tipo de resultado de la consulta.
        const total = (countRows as any)[0].total; 

        // 3. CONSULTA 2: OBTENER LOS RESULTADOS PAGINADOS
        const dataQuery = `
            SELECT id, name, price 
            FROM product ${whereClause}
            ORDER BY id ASC 
            LIMIT ? OFFSET ?`;
        
        // Parámetros para la consulta de datos: Parámetros de búsqueda + LIMIT + OFFSET
        const dataParams = searchParams.concat([limit, offset]);

        const [resultados] = await poolMySQL.execute(dataQuery, dataParams);

        // 4. RESPUESTA: Enviamos los resultados Y los datos de paginación
        res.json({
            resultados,
            total,
            page,
            limit
        });

    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Arrancar el Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    poolMySQL.getConnection()
        .then(() => console.log('✅ Conexión a MySQL exitosa.'))
        .catch((err: unknown) => console.error('❌ Error al conectar con MySQL:', err));
});