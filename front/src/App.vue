<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);

// Función que verifica si existe un token en localStorage
const checkAuthStatus = () => {
  isAuthenticated.value = !!localStorage.getItem('auth_token');
};

// Función para cerrar sesión
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  isAuthenticated.value = false;
  // Despachar el evento para actualizar otros componentes (LoginView lo usa)
  window.dispatchEvent(new Event('storage')); 
  router.push('/login'); // Redirigir al login
};

// 1. Verificar al montar (al cargar la página)
onMounted(() => {
  checkAuthStatus();
  // 2. Escuchar el evento 'storage' para reaccionar a cambios en otras pestañas o componentes
  window.addEventListener('storage', checkAuthStatus);
});

// 3. Limpiar el listener al desmontar
onUnmounted(() => {
  window.removeEventListener('storage', checkAuthStatus);
});
</script>

<template>
  <div id="app">
    <header class="navbar is-dark" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item is-size-4 has-text-weight-bold">
          CatálogoApp
        </router-link>
      </div>

      <div id="navbarBasicExample" class="navbar-menu is-active">
        <div class="navbar-start">
          <router-link to="/catalogo" class="navbar-item">
            Catálogo
          </router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <template v-if="isAuthenticated">
                <button @click="handleLogout" class="button is-danger">
                  <strong>Cerrar Sesión</strong>
                </button>
              </template>
              
              <template v-else>
                <router-link to="/login" class="button is-primary">
                  <strong>Iniciar Sesión</strong>
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="app-content">
      <router-view v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </router-view>
    </main>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          © {{ new Date().getFullYear() }} Plataforma Catálogo | Creado con **Vue.js y Bulma**.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Estilos Globales de Layout (se complementan con main.css) */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}

.app-content {
  flex-grow: 1; 
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
/* Estilos para el footer */
.footer {
  padding: 1rem 1.5rem;
  background-color: #f5f5f5;
}
</style>