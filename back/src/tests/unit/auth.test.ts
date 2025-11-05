import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Para asegurar que JWT_SECRET se carga

// Esta es una función simulada de tu login para crear un token
const generateTestToken = (id: number, email: string) => {
    // Aquí deberías usar el mismo secreto de tu archivo auth.ts
    const secret = process.env.JWT_SECRET || 'fallback_secret'; 
    return jwt.sign({ id, email }, secret, { expiresIn: '1h' });
};

describe('Prueba Unitaria: Generación de Tokens', () => {
    // Una prueba, enfocada en una cosa: la función generateTestToken
    it('Debe generar un token JWT que sea un string no vacío', () => {
        // ARRANGE: Prepara los datos (usuario simulado)
        const userId = 99;
        const userEmail = 'test@example.com';

        // ACT: Ejecuta la función
        const token = generateTestToken(userId, userEmail);

        // ASSERT: Verifica el resultado
        // 1. Debe ser un string (cadena de texto)
        expect(token).to.be.a('string'); 
        // 2. No debe estar vacío
        expect(token).to.not.be.empty; 
        // 3. Opcional: El token debe tener 3 partes (header.payload.signature)
        expect(token.split('.').length).to.equal(3);
    });
});
