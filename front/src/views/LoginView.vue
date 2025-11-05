<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const BACKEND_URL = 'http://localhost:3000'; 

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  
  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.';
    isLoading.value = false;
    return;
  }

  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: email.value,
      password: password.value,
    });
    
    localStorage.setItem('auth_token', response.data.token);
    
    // 🛑 CLAVE: Despachar el evento 'storage' para que App.vue actualice su navbar
    window.dispatchEvent(new Event('storage')); 
    
    alert('¡Inicio de sesión exitoso!');
    
    router.push('/catalogo'); 
    
  } catch (error: any) {
    console.error('Login error:', error);
    // Manejo robusto de errores de servidor
    const serverMessage = error.response?.data?.message;
    if (error.response?.status === 401) {
      errorMessage.value = serverMessage || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    } else if (error.response?.status === 429) {
      errorMessage.value = serverMessage || 'Demasiados intentos. Inténtalo de nuevo más tarde.';
    } else {
      errorMessage.value = serverMessage || 'Error al conectar con el servidor.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mt-6">
    <div class="columns is-centered">
      <div class="column is-full-mobile is-two-thirds-tablet is-half-desktop">
        
        <div class="card">
          <header class="card-header">
            <p class="card-header-title is-size-4">
              🔑 Iniciar Sesión
            </p>
          </header>
          
          <div class="card-content">
            <form @submit.prevent="handleLogin">
              
              <div class="field">
                <label class="label">Correo Electrónico</label>
                <div class="control has-icons-left">
                  <input 
                    class="input" 
                    :class="{ 'is-danger': errorMessage }"
                    type="email" 
                    v-model="email" 
                    placeholder="ejemplo@dominio.com" 
                    required 
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-envelope"></i>
                  </span>
                </div>
              </div>

              <div class="field">
                <label class="label">Contraseña</label>
                <div class="control has-icons-left">
                  <input 
                    class="input" 
                    :class="{ 'is-danger': errorMessage }"
                    type="password" 
                    v-model="password" 
                    placeholder="Ingresa tu contraseña (mínimo 6 caracteres)" 
                    required 
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
              </div>

              <p v-if="errorMessage" class="help is-danger mb-4">{{ errorMessage }}</p>

              <div class="field">
                <div class="control">
                  <button 
                    type="submit" 
                    class="button is-primary is-fullwidth" 
                    :class="{ 'is-loading': isLoading }"
                    :disabled="isLoading"
                  >
                    Entrar al Catálogo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mt-6 {
  margin-top: 3rem; 
}
</style>