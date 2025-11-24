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
        <input type="text" class="form-control" placeholder="Search recipes by title or description..."
               v-model="searchQuery">
      </div>
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
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Recipe Grid -->
    <div v-else class="row">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center"
               style="height: 200px; overflow: hidden;">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title"
                 class="img-fluid" style="object-fit: cover; width: 100%; height: 100%;">
            <span v-else class="text-muted">
              <i class="bi bi-image" style="font-size: 3rem;"></i>
            </span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="text-muted small mb-2">
              <i class="bi bi-star-fill text-warning"></i>
              {{ recipe.average_rating || 0 }}
              <span class="text-muted">({{ recipe.total_ratings || 0 }})</span>
              <span class="mx-2">|</span>
              <i class="bi bi-tag"></i> {{ recipe.category_name || 'Uncategorized' }}
            </p>
            <p class="card-text text-muted small flex-grow-1">
              {{ truncateText(recipe.description, 100) }}
            </p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <small class="text-muted">
                <i class="bi bi-person"></i> {{ recipe.author }}
              </small>
              <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}"
                           class="btn btn-sm btn-outline-primary">
                View Recipe
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="!loading && filteredRecipes.length === 0" class="alert alert-info text-center">
      <i class="bi bi-info-circle"></i>
      No recipes found.
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
import { ref, computed, onMounted } from 'vue'
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

    const isAuthenticated = computed(() => store.getters.isAuthenticated)

    const filteredRecipes = computed(() => {
      let filtered = recipes.value

      if (selectedCategory.value !== 'All') {
        filtered = filtered.filter(r => r.category_name === selectedCategory.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
        )
      }

      return filtered
    })

    const getRecipes = async () => {
      loading.value = true
      try {
        const response = await apiService.getRecipes()
        // Handle paginated response
        recipes.value = response.data.results || response.data
      } catch (error) {
        console.error('Error fetching recipes:', error)
      } finally {
        loading.value = false
      }
    }

    const filterCategory = (category) => {
      selectedCategory.value = category
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(getRecipes)

    return {
      recipes,
      searchQuery,
      selectedCategory,
      loading,
      isAuthenticated,
      filteredRecipes,
      filterCategory,
      truncateText
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
</style>