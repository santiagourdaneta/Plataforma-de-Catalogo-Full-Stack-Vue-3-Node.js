<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const goToCatalogo = () => {
  router.push('/catalogo');
};
</script>

<template>
  <div class="container is-fullhd">
    <div class="is-flex is-justify-content-center is-align-items-center is-flex-direction-column">
      <h1 class="title is-2 has-text-centered">🚀 Bienvenido al Catálogo Digital</h1>
      <p class="subtitle is-5 has-text-centered mb-5">La forma más rápida y segura de administrar tus productos.</p>
      
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button @click="goToLogin" class="button is-primary is-large">Iniciar Sesión</button>
        </p>
        <p class="control">
          <button @click="goToCatalogo" class="button is-link is-large is-light">Ver Catálogo</button>
        </p>
      </div>
    </div>
  </div>
</template>
