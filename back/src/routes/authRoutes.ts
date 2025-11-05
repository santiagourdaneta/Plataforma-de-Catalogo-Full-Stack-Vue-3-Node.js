// routes/authRoutes.ts

// IMPORTACIONES DE LIBRERÍAS (bcrypt, jsonwebtoken, mysql2 types)
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2/promise';
import { Router } from 'express';

// IMPORTACIONES DE VARIABLES DEFINIDAS FUERA DE ESTE ARCHIVO

// Importar el Pool de Conexiones a MySQL
import { poolMySQL } from '../db/database'; 

// Importar el Middleware Rate Limiter
import { loginLimiter } from '../middleware/rateLimiter';

// OBTENER LA CLAVE SECRETA
const JWT_SECRET = process.env.JWT_SECRET as string; 

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno.");
}

const router = Router();

// RUTA DE LOGIN DE USUARIO
router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    // 1. Validación básica de entrada
    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan el email o la contraseña.' });
    }

    let connection;
    try {
        connection = await poolMySQL.getConnection();

        // 2. Consulta Preparada Segura y Rápida
        // Busca el usuario y su hash de contraseña por email
        const [rows] = await connection.execute<RowDataPacket[]>(
                    'SELECT id, email, password FROM user WHERE email = ?',
                    [email]
                );

        const user = rows[0];

        // 3. Verificación de Usuario Existente
        if (!user) {
            // Retraso opcional para frustrar la enumeración de usuarios (seguridad por ofuscación)
            await bcrypt.compare('dummy', '$2b$10$abcdefghijklmnopqrstuvwx'); 
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const hashedPassword = user.password;

        // 4. Verificación de Contraseña con bcrypt.compare
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 5. Generación de JSON Web Token (JWT)
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload (datos no sensibles)
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        // 6. Respuesta Exitosa
        res.json({
            message: 'Inicio de sesión exitoso',
            token: token
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) {
            connection.release(); // Liberar la conexión al pool
        }
    }
});

export default router;