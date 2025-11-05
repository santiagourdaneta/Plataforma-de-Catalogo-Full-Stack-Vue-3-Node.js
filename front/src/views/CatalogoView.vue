<template>
<div class="catalogo-container">
    <h2>🛍️ Nuestro Catálogo</h2>
    
    <div v-if="products.length" class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        
        <div class="product-image-placeholder">
          <p>Imagen del Producto</p>
          <span class="price-tag">${{ product.price }}</span>
        </div>
        
        <div class="card-content">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">Disponible en todas las tallas y colores.</p>
        </div>
      </div>
    </div>
    
    <p v-else-if="!products.length && pagination.totalItems === 0">No se encontraron productos.</p>
    <hr v-if="pagination.totalPages > 1" class="separator"/>

    <div v-if="pagination.totalPages > 1" class="pagination-controls">
      <button 
        @click="changePage(pagination.currentPage - 1)" 
        :disabled="pagination.currentPage === 1"
        class="btn-pagination">
        ← Anterior
      </button>

      <template v-for="page in visiblePages" :key="page">
        <button v-if="page !== '...'" 
                @click="changePage(page)" 
                :class="{ 'btn-page': true, 'active': page === pagination.currentPage }">
          {{ page }}
        </button>
        <span v-else class="ellipsis">...</span>
      </template>

      <button 
        @click="changePage(pagination.currentPage + 1)" 
        :disabled="pagination.currentPage === pagination.totalPages"
        class="btn-pagination">
        Siguiente →
      </button>
      
      <span class="page-info">Mostrando página {{ pagination.currentPage }} de {{ pagination.totalPages }}</span>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/buscador'; 

const products = ref([]);

const searchQuery = ref('');

const pagination = reactive({
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
});

// Propiedad computada para generar los números de página visibles
const visiblePages = computed(() => {
    // Lógica compleja para mostrar páginas 1, 2, 3, ..., 10
    const { totalPages, currentPage } = pagination;
    const maxVisiblePages = 5; 
    const pages = [];
    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) { pages.push(i); }
    } else {
        pages.push(1);
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        if (startPage > 2) { pages.push('...'); }
        for (let i = startPage; i <= endPage; i++) { pages.push(i); }
        if (endPage < totalPages - 1) { pages.push('...'); }
        pages.push(totalPages);
    }
    return pages;
});

// Maneja el cambio de página
const changePage = (newPage) => {
    // Asegurarse de que la página es un número antes de intentar cambiar
    if (typeof newPage === 'number' && newPage >= 1 && newPage <= pagination.totalPages) {
        pagination.currentPage = newPage;
        fetchProducts(); // Llama a la API con la nueva página
    }
};

const errorMessage = ref(null);

// Función central para obtener datos de la API
const fetchProducts = async () => {
  try {
    errorMessage.value = null; // Limpiar errores al inicio de la petición
    // 1. Construir parámetros de la URL
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.limit.toString(),
    });

    // 2. Añadir búsqueda solo si no está vacía
    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    
    // 3. Llamar a la API
    const response = await axios.get(`${API_URL}?${params.toString()}`);
    const data = response.data;

    if (data.resultados && Array.isArray(data.resultados)) {
            products.value = data.resultados;
            
            // Mapear propiedades de nivel superior al objeto 'pagination'
            Object.assign(pagination, {
                totalItems: data.total || 0, // Usar 'total' de la respuesta
                totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
                currentPage: data.page || 1,
                limit: data.limit || 10,
            });
            
            // Limpiar el mensaje de error si la petición fue exitosa
           errorMessage.value = null; 
        } else {
            // Este bloque se ejecutará si 'resultados' no es un array 
            products.value = [];
            console.warn('El backend no devolvió un array válido en la clave "resultados".');
        }
    
   
   }catch (error) {

    // En caso de fallo de red, se asegura de que products y pagination 
        // mantengan un estado seguro (array vacío, objeto con valores predeterminados)
        console.error('Error al obtener los productos:', error);

 // Si hay un error, aseguramos que el array de productos esté VACIÓ para que la plantilla lo maneje correctamente (v-if="products.length" será falso).
    // Si Axios falla (Network Error), asegúrate de que el estado sea seguro
    products.value = []; 
    Object.assign(pagination, { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
        // Mostrar un mensaje de error al usuario
        errorMessage.value = 'Error de conexión. Asegúrate de que el servidor esté activo.';
  }
};

// Maneja la acción de búsqueda
const handleSearch = () => {
    // Cuando el usuario busca, siempre reiniciamos a la página 1
    pagination.currentPage = 1;
    fetchProducts();
};

// Carga inicial (mostrar los 10 primeros por defecto)
onMounted(() => {
  fetchProducts();
});
</script>

<style>

.catalogo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.products-grid {
   
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    padding: 20px 0;
}

.product-card {
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); 
    transition: transform 0.2s, box-shadow 0.2s;
    background: #ffffff;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.product-image-placeholder {
    height: 180px;
    background: linear-gradient(135deg, #f0f0f0, #e8e8e8);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    font-style: italic;
    color: #999;
}

.price-tag {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: #ff5722;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 1.1em;
    z-index: 10;
}

.card-content {
    padding: 15px;
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.product-name {
    font-size: 1.3em;
    margin-top: 0;
    color: #1e3a8a;
}

.btn-primary {
    background-color: #1e40af;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.2s;
}
.btn-primary:hover {
    background-color: #1d4ed8;
}

.separator {
    border: 0;
    height: 1px;
    background: #ccc;
    margin: 30px 0;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 20px 0;
}

.btn-pagination, .btn-page {
    background: #fff;
    border: 1px solid #ccc;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s, color 0.2s;
}

.btn-pagination:hover:not(:disabled), .btn-page:hover:not(.active) {
    background-color: #f0f0f0;
    border-color: #aaa;
}

.btn-page.active {
    background-color: #1e40af; 
    color: white;
    border-color: #1e40af;
    font-weight: bold;
}

.btn-pagination:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.ellipsis {
    padding: 0 5px;
    color: #666;
}

.page-info {
    margin-left: 20px;
    color: #666;
    font-size: 0.95em;
}
</style>
