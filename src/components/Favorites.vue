<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-heart-fill text-danger"></i> My Favorites</h2>
      <span class="badge bg-secondary fs-6">{{ favorites.length }} recipes</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Loading favorites...</p>
    </div>

    <!-- Favorites Grid -->
    <div v-else-if="favorites.length > 0" class="row">
      <div v-for="favorite in favorites" :key="favorite.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
          <!-- Image -->
          <div class="position-relative">
            <div class="bg-light d-flex align-items-center justify-content-center" style="height: 180px;">
              <img v-if="getRecipe(favorite).image_url" 
                   :src="getRecipe(favorite).image_url"
                   :alt="getRecipe(favorite).title" 
                   class="img-fluid" 
                   style="max-height: 180px; object-fit: cover;"
                   @error="$event.target.style.display='none'">
              <i v-else class="bi bi-image text-muted" style="font-size: 3rem;"></i>
            </div>
            <!-- Remove Button -->
            <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                    @click="removeFavorite(getRecipe(favorite).id)" title="Remove from favorites">
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>

          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ getRecipe(favorite).title }}</h5>
            <p class="text-muted small mb-2">
              <i class="bi bi-person"></i> {{ getRecipe(favorite).author }}
              <span class="mx-1">|</span>
              <i class="bi bi-tag"></i> {{ getRecipe(favorite).category_name || 'Uncategorized' }}
            </p>
            <p class="card-text small flex-grow-1">
              {{ truncate(getRecipe(favorite).description, 80) }}
            </p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div>
                <i class="bi bi-star-fill text-warning"></i>
                {{ (getRecipe(favorite).average_rating || 0).toFixed(1) }}
              </div>
              <router-link :to="{name: 'RecipeDetail', params: {id: getRecipe(favorite).id}}" 
                           class="btn btn-primary btn-sm">
                View Recipe
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-heart text-muted" style="font-size: 4rem;"></i>
      <h4 class="mt-3 text-muted">No favorites yet!</h4>
      <p class="text-muted">Browse recipes and click the heart icon to add them here.</p>
      <router-link :to="{name: 'RecipeList'}" class="btn btn-primary">
        <i class="bi bi-search"></i> Browse Recipes
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import apiService from '@/http/APIService'

export default {
  name: 'Favorites',
  setup() {
    const favorites = ref([])
    const loading = ref(true)

    const fetchFavorites = async () => {
      loading.value = true
      try {
        const response = await apiService.getFavorites()
        // Handle paginated or array response
        favorites.value = response.data.results || response.data || []
        console.log('Favorites loaded:', favorites.value.length)
      } catch (err) {
        console.error('Error fetching favorites:', err)
        favorites.value = []
      } finally {
        loading.value = false
      }
    }

    // Helper to get recipe from favorite object (handles different API structures)
    const getRecipe = (favorite) => {
      // If favorite.recipe exists, use it; otherwise treat favorite as the recipe
      return favorite.recipe || favorite
    }

    const removeFavorite = async (recipeId) => {
      if (!confirm('Remove from favorites?')) return

      try {
        await apiService.removeFavorite(recipeId)
        // Remove from local array
        favorites.value = favorites.value.filter(f => {
          const recipe = getRecipe(f)
          return recipe.id !== recipeId
        })
      } catch (err) {
        console.error('Error removing favorite:', err)
        alert('Failed to remove favorite')
      }
    }

    const truncate = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(fetchFavorites)

    return {
      favorites,
      loading,
      getRecipe,
      removeFavorite,
      truncate
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-3px);
}
</style>
