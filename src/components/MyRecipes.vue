<template>
  <div class="my-recipes container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-journal-text"></i> My Recipes</h2>
      <router-link :to="{name: 'RecipeCreate'}" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> New Recipe
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading your recipes...</p>
    </div>

    <!-- Recipe List -->
    <div v-else-if="myRecipes.length > 0">
      <div v-for="recipe in myRecipes" :key="recipe.id" class="card mb-3 shadow-sm">
        <div class="card-body d-flex">
          <!-- Recipe Image -->
          <div class="recipe-image bg-light d-flex align-items-center justify-content-center me-3 rounded">
            <img 
              v-if="recipe.image_url" 
              :src="recipe.image_url" 
              :alt="recipe.title"
              class="img-fluid rounded"
              @error="handleImageError($event)"
            >
            <i v-else class="bi bi-image text-muted" style="font-size: 2rem;"></i>
          </div>
          
          <!-- Recipe Details -->
          <div class="flex-grow-1">
            <h5 class="mb-1">{{ recipe.title }}</h5>
            <p class="text-muted small mb-2">
              <span class="badge bg-secondary me-2">{{ recipe.category_name || 'Uncategorized' }}</span>
              <i class="bi bi-clock"></i> {{ recipe.prep_time + recipe.cook_time }} min |
              <i class="bi bi-people"></i> {{ recipe.servings }} servings |
              <i class="bi bi-star-fill text-warning"></i> {{ recipe.average_rating || 0 }}
            </p>
            <p class="card-text text-muted small">
              {{ truncateText(recipe.description, 150) }}
            </p>
            <small class="text-muted">
              <i class="bi bi-calendar"></i> Created {{ formatDate(recipe.created_at) }}
            </small>
          </div>
          
          <!-- Action Buttons -->
          <div class="d-flex flex-column justify-content-center ms-3">
            <button 
              class="btn btn-sm btn-outline-primary mb-2" 
              @click="viewRecipe(recipe.id)"
            >
              <i class="bi bi-eye"></i> View
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary mb-2" 
              @click="editRecipe(recipe.id)"
            >
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button 
              class="btn btn-sm btn-outline-danger" 
              @click="deleteRecipe(recipe.id)"
              :disabled="deleting === recipe.id"
            >
              <span v-if="deleting === recipe.id" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <div class="mb-4">
        <i class="bi bi-journal-x text-muted" style="font-size: 4rem;"></i>
      </div>
      <h4 class="text-muted">No recipes yet</h4>
      <p class="text-muted">You haven't created any recipes yet. Start by adding your first recipe!</p>
      <router-link :to="{name: 'RecipeCreate'}" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Create Your First Recipe
      </router-link>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show mt-3" role="alert">
      <i class="bi bi-check-circle"></i> {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = null"></button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
      <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = null"></button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'MyRecipes',
  setup() {
    const router = useRouter()
    const myRecipes = ref([])
    const loading = ref(true)
    const deleting = ref(null)
    const successMessage = ref(null)
    const errorMessage = ref(null)

    const getMyRecipes = async () => {
      loading.value = true
      errorMessage.value = null
      
      try {
        const response = await apiService.getMyRecipes()
        myRecipes.value = response.data
      } catch (error) {
        console.error('Error fetching recipes:', error)
        
        try {
          const allRecipes = await apiService.getRecipes()
          const username = localStorage.getItem('username')
          const recipesData = allRecipes.data.results || allRecipes.data
          myRecipes.value = recipesData.filter(r => r.author === username)
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          errorMessage.value = 'Failed to load your recipes. Please try again.'
          myRecipes.value = []
        }
      } finally {
        loading.value = false
      }
    }

    const viewRecipe = (id) => {
      router.push({ name: 'RecipeDetail', params: { id } })
    }

    const editRecipe = (id) => {
      router.push({ name: 'RecipeEdit', params: { id } })
    }

    const deleteRecipe = async (id) => {
      if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        return
      }

      deleting.value = id
      errorMessage.value = null
      successMessage.value = null

      try {
        await apiService.deleteRecipe(id)
        myRecipes.value = myRecipes.value.filter(recipe => recipe.id !== id)
        successMessage.value = 'Recipe deleted successfully!'
        
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
      } catch (error) {
        console.error('Error deleting recipe:', error)
        
        if (error.response?.status === 403) {
          errorMessage.value = 'You do not have permission to delete this recipe.'
        } else if (error.response?.status === 404) {
          errorMessage.value = 'Recipe not found. It may have already been deleted.'
          getMyRecipes()
        } else {
          errorMessage.value = 'Failed to delete recipe. Please try again.'
        }
      } finally {
        deleting.value = null
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown date'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 14) return '1 week ago'
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    onMounted(getMyRecipes)

    return {
      myRecipes,
      loading,
      deleting,
      successMessage,
      errorMessage,
      viewRecipe,
      editRecipe,
      deleteRecipe,
      formatDate,
      truncateText,
      handleImageError
    }
  }
}
</script>

<style scoped>
.recipe-image {
  width: 120px;
  height: 120px;
  min-width: 120px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.btn-sm {
  min-width: 80px;
}
</style>
