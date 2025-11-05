import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import CatalogView from '@/views/CatalogView.vue'; 
import TestView from '@/views/TestView.vue'; 

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView 
  },
 
  {
    path: '/test',
    name: 'Test',
    component: TestView 
  },

  {
    path: '/catalogo', 
    name: 'Catalogo',
    component: CatalogView 
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;