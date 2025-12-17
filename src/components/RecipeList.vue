<template>
  <div class="recipe-list container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-grid-3x3-gap"></i> Browse Recipes</h2>
      <router-link :to="{name: 'RecipeCreate'}" class="btn btn-primary" v-if="isAuthenticated">
        <i class="bi bi-plus-lg"></i> Add Recipe
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" placeholder="Search recipes by title, description, or ingredients..."
               v-model="searchQuery" @input="handleSearchInput">
        <button v-if="searchQuery" class="btn btn-outline-secondary" type="button" @click="clearSearch">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <small v-if="searchQuery" class="text-muted">
        Showing results for "{{ searchQuery }}" 
        <span v-if="!loading">({{ filteredRecipes.length }} found)</span>
      </small>
    </div>

    <!-- Category Filter -->
    <div class="mb-4">
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'All' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('All')">
        All
      </button>
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'Breakfast' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('Breakfast')">
        <i class="bi bi-sunrise"></i> Breakfast
      </button>
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'Lunch' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('Lunch')">
        <i class="bi bi-sun"></i> Lunch
      </button>
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'Dinner' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('Dinner')">
        <i class="bi bi-moon"></i> Dinner
      </button>
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'Dessert' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('Dessert')">
        <i class="bi bi-cake2"></i> Dessert
      </button>
      <button class="btn me-2 mb-2"
              :class="selectedCategory === 'Snack' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterCategory('Snack')">
        <i class="bi bi-cup-hot"></i> Snack
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading recipes...</p>
    </div>

    <!-- Recipe Grid -->
    <div v-else-if="filteredRecipes.length > 0" class="row g-4">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
               style="height: 200px; overflow: hidden;">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" 
                 class="img-fluid" style="object-fit: cover; width: 100%; height: 100%;">
            <i v-else class="bi bi-image text-muted" style="font-size: 3rem;"></i>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="card-text text-muted small">
              <span class="badge bg-secondary me-2">{{ recipe.category_name || 'Uncategorized' }}</span>
              <i class="bi bi-person"></i> {{ recipe.author }}
            </p>
            <p class="card-text">{{ truncateText(recipe.description, 100) }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-star-fill text-warning"></i>
                <span>{{ recipe.average_rating ? recipe.average_rating.toFixed(1) : 'N/A' }}</span>
              </div>
              <div class="text-muted small">
                <i class="bi bi-clock"></i> {{ (recipe.prep_time || 0) + (recipe.cook_time || 0) }} min
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}" class="btn btn-outline-primary w-100">
              View Recipe
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-5">
      <i class="bi bi-search" style="font-size: 3rem;"></i>
      <h4 class="mt-3">No recipes found</h4>
      <p class="text-muted" v-if="searchQuery">
        No recipes match "{{ searchQuery }}"<span v-if="selectedCategory !== 'All'"> in {{ selectedCategory }}</span>. 
        Try a different search term or category.
      </p>
      <p class="text-muted" v-else-if="selectedCategory !== 'All'">
        No recipes found in the {{ selectedCategory }} category.
      </p>
      <p class="text-muted" v-else>
        No recipes available yet.
      </p>
      <span v-if="isAuthenticated">
        <router-link :to="{name: 'RecipeCreate'}">Be the first to add one!</router-link>
      </span>
      <span v-else>
        <router-link :to="{name: 'Register'}">Register</router-link> to add your own recipes!
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeList',
  setup() {
    const store = useStore()
    const recipes = ref([])
    const searchQuery = ref('')
    const selectedCategory = ref('All')
    const loading = ref(true)
    const categories = ref([])
    
    // Debounce timer reference
    let searchTimeout = null

    const isAuthenticated = computed(() => store.getters.isAuthenticated)

    // Filter recipes by category (client-side for category since we fetch all)
    const filteredRecipes = computed(() => {
      let filtered = recipes.value

      if (selectedCategory.value !== 'All') {
        filtered = filtered.filter(r => r.category_name === selectedCategory.value)
      }

      return filtered
    })

    // Fetch recipes from API with optional search parameter
    const getRecipes = async (search = '') => {
      loading.value = true
      try {
        const params = {}
        if (search) {
          params.search = search
        }
        const response = await apiService.getRecipes(params)
        // Handle paginated response
        recipes.value = response.data.results || response.data
      } catch (error) {
        console.error('Error fetching recipes:', error)
        recipes.value = []
      } finally {
        loading.value = false
      }
    }

    // Debounced search handler - waits 300ms after user stops typing
    const handleSearchInput = () => {
      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      // Set new timeout for debounced search
      searchTimeout = setTimeout(() => {
        getRecipes(searchQuery.value)
      }, 300)
    }

    // Clear search and reload all recipes
    const clearSearch = () => {
      searchQuery.value = ''
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      getRecipes()
    }

    const filterCategory = (category) => {
      selectedCategory.value = category
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    // Fetch categories for potential future use
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        categories.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    onMounted(() => {
      getRecipes()
      fetchCategories()
    })

    return {
      recipes,
      searchQuery,
      selectedCategory,
      loading,
      isAuthenticated,
      filteredRecipes,
      filterCategory,
      truncateText,
      handleSearchInput,
      clearSearch
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.input-group-text {
  background-color: white;
}
</style>
