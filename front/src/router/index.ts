// front/src/router/index.ts

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'; 

// 🛑 Define el tipo 'routes' directamente aquí para evitar confusiones de importación
const routes: RouteRecordRaw[] = [ 
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue') 
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/catalogo',
    name: 'Catalogo',
    component: () => import('../views/CatalogoView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;