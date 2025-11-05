// back/src/routes/auth.ts

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z, ZodType } from 'zod';
import rateLimit from 'express-rate-limit'; 
const prisma = new PrismaClient();
const router = Router();

// 1. ESQUEMAS DE VALIDACIÓN ZOD 
const registerSchema = z.object({
    email: z.string().email('Email inválido.').min(5, 'Email debe tener al menos 5 caracteres.'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres.'),
    name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres.'),
});

const loginSchema = z.object({
    email: z.string().email('Email inválido.'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres.'),
});

// 2. MIDDLEWARE DE VALIDACIÓN GENÉRICO
const validate = (schema: ZodType<any>) => 
    (req: Request, res: Response, next: Function) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
           return res.status(400).json({ 
                message: 'Error de validación de datos', 
                errors: error.errors 
            });
        }
    };

// 3. MIDDLEWARE DE RATE LIMIT ESPECÍFICO PARA LOGIN 🛡️
// Esto previene ataques de fuerza bruta en la ruta de inicio de sesión.
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos (tiempo de ventana)
    max: 5, // Límite de 5 intentos por IP en 5 minutos
    message: {
        message: 'Demasiados intentos de inicio de sesión fallidos. Inténtalo de nuevo en 5 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});


// 4. RUTA DE REGISTRO (SIGNUP) 
// Endpoint: POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: { id: true, email: true, name: true },
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });

    } catch (error) {
        console.error('Error durante el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// 5. RUTA DE INICIO DE SESIÓN (LOGIN) - CON RATE LIMIT
// Endpoint: POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req: Request, res: Response) => { 

    const { email, password } = req.body;

        // 🛑 LÍNEAS DE DEPURACIÓN AÑADIDAS 🛑
                console.log('--- DEPURACIÓN DE LOGIN ---');
                console.log(`Email del formulario: ${email}`);
                console.log('Contraseña RECIBIDA del formulario: [REDACTED]'); // No log in clear text!

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
               
                console.log(`Contraseña ALMACENADA en la DB (HASH): ${user.password}`); // ¡Tu hash!
                console.log('---------------------------');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        console.log('JWT_SECRET usado para verificación:', process.env.JWT_SECRET);

        if (!process.env.JWT_SECRET) {
             throw new Error("JWT_SECRET no está configurado en el archivo .env");
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET,            
            { expiresIn: '1h' }                
        );

        res.status(200).json({ 
            message: 'Login exitoso', 
            token, 
            user: { id: user.id, email: user.email, name: user.name } 
        });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;