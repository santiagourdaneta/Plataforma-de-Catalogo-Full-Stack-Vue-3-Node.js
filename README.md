# 🛍️ Plataforma de Catálogo Full-Stack (Vue 3 + Node.js/Express)

Este proyecto es una aplicación web de catálogo de productos completa construida con un stack moderno: **Vue 3** (Composition API, TypeScript) para el frontend y **Node.js con Express y TypeScript** para el backend. Incluye manejo de datos, paginación dinámica y una interfaz de usuario limpia y responsiva.

## 🚀 Tecnologías Utilizadas

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | **Vue 3** | Framework principal, usando Composition API y Script Setup. |
| **Build Tool** | **Vite** | Empaquetador rápido para el desarrollo y producción. |
| **Routing** | **Vue Router** | Gestión de rutas SPA. |
| **API Client** | **Axios** | Cliente HTTP para la comunicación con el backend. |
| **Backend** | **Node.js / Express** | Servidor API RESTful. |
| **Lenguaje** | **TypeScript** | Para tipado fuerte tanto en frontend como en backend. |

## ⚙️ Configuración del Proyecto

Sigue estos pasos para levantar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone [https://github.com/santiagourdaneta/Plataforma-de-Catalogo-Full-Stack-Vue-3-Node.js](https://github.com/santiagourdaneta/Plataforma-de-Catalogo-Full-Stack-Vue-3-Node.js)
cd Plataforma-de-Catalogo-Full-Stack-Vue-3-Node.js

2. Configurar el Backend

cd back
npm install
# Inicia el servidor
npm run dev # O el comando que uses para iniciar Express
# El servidor debería correr en http://localhost:3000

3. Configurar el Frontend

cd front
npm install
# Inicia la aplicación Vue
npm run dev
# La aplicación debería correr en http://localhost:5173

✨ Características Principales

Paginación Dinámica: Paginación optimizada para grandes volúmenes de datos (/api/buscador?page=X&limit=10).

Diseño de Tarjetas: Listado de productos visualmente mejorado mediante una cuadrícula de tarjetas (CSS Grid/Flexbox).

Vistas Tipadas: Uso de TypeScript en Vue para una mejor mantenibilidad y menos errores en tiempo de ejecución.

Separación de Responsabilidades: Claro aislamiento entre la lógica de presentación (Vue) y la lógica de negocio (Express).

🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un Pull Request si encuentras errores o tienes sugerencias de mejora.

vue-3, typescript, nodejs, express, frontend, backend, full-stack, pagination, catalogue

#Vue3 #TypeScript #NodeJS #ExpressJS #FullStack #WebDev #CatalogApp