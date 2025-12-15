<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-grid-3x3-gap"></i> Browse Recipes</h2>
      <router-link v-if="isAuthenticated" :to="{name: 'RecipeCreate'}" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Add Recipe
      </router-link>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" v-model="searchQuery" placeholder="Search recipes...">
      </div>
    </div>

    <!-- Category Filter -->
    <div class="mb-4">
      <button v-for="cat in ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert']" :key="cat"
              class="btn me-2 mb-2"
              :class="selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectedCategory = cat">
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Loading recipes...</p>
    </div>

    <!-- Recipe Grid -->
    <div v-else-if="filteredRecipes.length > 0" class="row">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="bg-light d-flex align-items-center justify-content-center" style="height: 180px;">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title"
                 class="img-fluid" style="max-height: 180px; object-fit: cover;"
                 @error="$event.target.style.display='none'">
            <i v-else class="bi bi-image text-muted" style="font-size: 3rem;"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="text-muted small mb-2">
              <i class="bi bi-star-fill text-warning"></i> {{ recipe.average_rating || 0 }}
              <span class="mx-2">|</span>
              <i class="bi bi-tag"></i> {{ recipe.category_name || 'Uncategorized' }}
            </p>
            <p class="card-text small flex-grow-1">{{ truncate(recipe.description, 80) }}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <small class="text-muted"><i class="bi bi-person"></i> {{ recipe.author }}</small>
              <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}" class="btn btn-sm btn-outline-primary">
                View
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-5">
      <i class="bi bi-journal-x text-muted" style="font-size: 4rem;"></i>
      <h4 class="mt-3 text-muted">No recipes found</h4>
      <router-link v-if="isAuthenticated" :to="{name: 'RecipeCreate'}" class="btn btn-primary mt-3">
        Add the first recipe!
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeList',
  setup() {
    const store = useStore()
    const recipes = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedCategory = ref('All')

    const isAuthenticated = computed(() => store.getters.isAuthenticated)

    const filteredRecipes = computed(() => {
      let filtered = recipes.value

      if (selectedCategory.value !== 'All') {
        filtered = filtered.filter(r => 
          r.category_name?.toLowerCase() === selectedCategory.value.toLowerCase()
        )
      }

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(r =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.ingredients?.toLowerCase().includes(q)
        )
      }

      return filtered
    })

    const fetchRecipes = async () => {
      loading.value = true
      try {
        const response = await apiService.getRecipes()
        // Handle paginated or array response
        recipes.value = response.data.results || response.data || []
        console.log('Recipes loaded:', recipes.value.length)
      } catch (err) {
        console.error('Error loading recipes:', err)
        recipes.value = []
      } finally {
        loading.value = false
      }
    }

    const truncate = (text, len) => {
      if (!text) return ''
      return text.length > len ? text.substring(0, len) + '...' : text
    }

    onMounted(fetchRecipes)

    return {
      recipes, loading, searchQuery, selectedCategory,
      isAuthenticated, filteredRecipes, truncate
    }
  }
}
</script>

<style scoped>
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-3px); }
</style>
