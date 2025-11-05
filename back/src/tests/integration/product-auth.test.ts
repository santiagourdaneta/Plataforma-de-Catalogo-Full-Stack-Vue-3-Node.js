// 1. Crear una aplicación Express minimalista SOLO para la prueba
const app = express();
const mockRoute = express.Router();

// 2. Aplicar el middleware y una función de prueba exitosa
mockRoute.get('/protected', authMiddleware, (req, res) => {
    // Si llega aquí, significa que el token fue válido
    res.status(200).send({ message: 'Acceso concedido' });
});

app.use(mockRoute);

// Secretos para generar un token VÁLIDO y uno INVÁLIDO
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; 
const VALID_TOKEN = jwt.sign({ id: 1, email: 'user@test.com' }, JWT_SECRET, { expiresIn: '1h' });
const INVALID_TOKEN = 'esto.es.un.token.invalido';
const EXPIRED_TOKEN = jwt.sign({ id: 2, email: 'expired@test.com' }, JWT_SECRET, { expiresIn: '0s' }); // Expira inmediatamente

describe('Prueba de Integración: AuthMiddleware', () => {

    it('Debe retornar 403 si no se provee ningún token', async () => {
        // La prueba falla si el status no es 403
        const res = await request(app).get('/protected');
        expect(res.status).to.equal(403);
        expect(res.body.message).to.include('Token no encontrado');
    });

    it('Debe retornar 403 si el token es inválido o malformado', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${INVALID_TOKEN}`); // Enviamos el token mal

        expect(res.status).to.equal(403);
        expect(res.body.message).to.include('Token inválido o expirado');
    });

    it('Debe retornar 403 si el token ha expirado', async () => {
        // Esperamos un segundo para asegurarnos de que el token expiró (si la prueba es muy rápida)
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${EXPIRED_TOKEN}`); 

        expect(res.status).to.equal(403);
        expect(res.body.message).to.include('Token inválido o expirado');
    });

    it('Debe retornar 200 si se provee un token válido', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${VALID_TOKEN}`); // Enviamos el token OK

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Acceso concedido');
    });
});
