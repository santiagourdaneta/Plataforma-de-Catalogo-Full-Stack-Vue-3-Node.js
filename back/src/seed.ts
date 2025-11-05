// back/src/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const NUM_PRODUCTS = 100;

async function main() {
  console.log(`Iniciando la inserción de ${NUM_PRODUCTS} productos...`);

  // 1. Array para almacenar los datos de los 100 productos
  const productsData = [];

  // 2. Generar 100 productos de ejemplo
  for (let i = 1; i <= NUM_PRODUCTS; i++) {
    productsData.push({
      name: `Producto de Prueba ${i}`,
      description: `Descripción detallada para el producto número ${i}. Este es un artículo de alta calidad.`,
      price: parseFloat((Math.random() * 100 + 10).toFixed(2)), // Precio aleatorio entre 10 y 110
    });
  }

  try {
    // 3. Insertar todos los productos en una sola transacción (¡la clave para la velocidad!)
    const result = await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true, // Opcional: Ignorar si ya existe un producto duplicado
    });

    console.log(`✅ ¡Inserción masiva completada! Se crearon ${result.count} productos nuevos.`);
  } catch (e) {
    console.error('❌ Error durante la inserción masiva:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();