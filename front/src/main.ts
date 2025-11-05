// front/src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bulma/css/bulma.min.css'; 

// 1. Crea la instancia de la aplicación Vue
const app = createApp(App);

// 2. Monta el router en la aplicación 
app.use(router);

// 3. Monta la aplicación en el elemento div#app de index.html
app.mount('#app');