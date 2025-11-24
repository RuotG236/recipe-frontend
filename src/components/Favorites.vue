<template>
  <div class="favorites container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-heart-fill text-danger"></i> My Favorite Recipes</h2>
      <span class="badge bg-secondary">{{ favorites.length }} recipes</span>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="favorites.length > 0" class="row">
      <div v-for="favorite in favorites" :key="favorite.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="position-relative">
            <div class="card-img-top bg-light d-flex align-items-center justify-content-center"
                 style="height: 200px;">
              <img v-if="favorite.recipe.image_url" :src="favorite.recipe.image_url"
                   alt="Recipe image" class="img-fluid" style="max-height: 200px;">
              <span v-else class="text-muted"><i class="bi bi-image fs-1"></i></span>
            </div>
            <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                    @click="removeFavorite(favorite.recipe.id)">
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>

          <div class="card-body">
            <h5 class="card-title">{{ favorite.recipe.title }}</h5>
            <p class="text-muted small">
              <i class="bi bi-person"></i> {{ favorite.recipe.author }} |
              <i class="bi bi-tag"></i> {{ favorite.recipe.category_name || 'Uncategorized' }}
            </p>
            <p class="card-text">{{ truncateText(favorite.recipe.description, 100) }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-star-fill text-warning"></i>
                {{ favorite.recipe.average_rating || 0 }}
                ({{ favorite.recipe.total_ratings || 0 }} ratings)
              </div>
              <router-link :to="{name: 'RecipeDetail', params: {id: favorite.recipe.id}}"
                           class="btn btn-primary btn-sm">
                View Recipe
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info text-center">
      <h4>No favorites yet!</h4>
      <p>Start browsing recipes and click the heart icon to add them to your favorites.</p>
      <router-link :to="{name: 'RecipeList'}" class="btn btn-primary">
        Browse Recipes
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
        favorites.value = response.data
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        loading.value = false
      }
    }

    const removeFavorite = async (recipeId) => {
      if (!confirm('Remove from favorites?')) return

      try {
        await apiService.removeFavorite(recipeId)
        favorites.value = favorites.value.filter(f => f.recipe.id !== recipeId)
      } catch (error) {
        console.error('Error removing favorite:', error)
      }
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(fetchFavorites)

    return {
      favorites,
      loading,
      removeFavorite,
      truncateText
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}
</style>