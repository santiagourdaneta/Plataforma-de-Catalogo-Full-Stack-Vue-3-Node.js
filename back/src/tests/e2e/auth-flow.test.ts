import { expect } from 'chai';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../server'; // 🛑 Importa tu servidor Express completo
import 'dotenv/config'; 

const prisma = new PrismaClient();
const agent = request(app); // Creamos un agente para simular peticiones

// 1. Datos de un usuario que vamos a crear y luego eliminar
const TEST_USER = {
    email: 'e2e_test@mail.com',
    password: 'passwordSeguro123'
};

let validToken = '';

describe('Prueba E2E: Flujo Completo de Autenticación y Catálogo', () => {

    // Antes de empezar, eliminamos al usuario de prueba para tener un ambiente limpio
    before(async () => {
        await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    });

    // Al finalizar todas las pruebas, eliminamos al usuario de prueba
    after(async () => {
        await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
        await prisma.$disconnect();
    });

    // PRUEBA 1: Registro (Primer paso del viaje)
    it('1. POST /api/auth/register debe registrar un usuario y retornar 201', async () => {
        const res = await agent.post('/api/auth/register')
            .send(TEST_USER);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('message').that.includes('registrado con éxito');
    });

    // PRUEBA 2: Login (Obtener el token)
    it('2. POST /api/auth/login debe autenticar al usuario y retornar un token', async () => {
        const res = await agent.post('/api/auth/login')
            .send(TEST_USER);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token').that.is.a('string').and.not.empty;
        validToken = res.body.token; // 🛑 Guardamos el token para el siguiente paso
    });

    // PRUEBA 3: Catálogo (Usar el token en la ruta protegida)
    it('3. GET /api/products debe acceder al catálogo usando el token válido', async () => {
        const res = await agent.get('/api/products')
            .set('Authorization', `Bearer ${validToken}`); // 🛑 Usamos el token guardado

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('products').that.is.an('array');
        expect(res.body).to.have.property('meta');
    });
});
