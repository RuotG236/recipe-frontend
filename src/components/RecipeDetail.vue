<template>
  <div class="recipe-detail container" v-if="recipe">
    <div class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 400px;">
            <img v-if="recipe.image_url" :src="recipe.image_url" alt="Recipe image" class="img-fluid">
            <span v-else class="text-muted h3"><i class="bi bi-image"></i> No Image</span>
          </div>
          
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="card-title">{{ recipe.title }}</h2>
                <p class="text-muted">
                  By {{ recipe.author }} | 
                  <span class="badge bg-secondary">{{ recipe.category_name || 'Uncategorized' }}</span>
                </p>
              </div>
              
              <div class="text-end">
                <div class="mb-2">
                  <i class="bi bi-star-fill text-warning"></i>
                  <strong>{{ recipe.average_rating || 0 }}</strong> 
                  ({{ recipe.total_ratings }} ratings)
                </div>
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-danger" @click="toggleFavorite" 
                          :disabled="!isAuthenticated">
                    <i class="bi" :class="isFavorited ? 'bi-heart-fill' : 'bi-heart'"></i>
                  </button>
                  <button class="btn btn-outline-warning" @click="showRateModal = true"
                          :disabled="!isAuthenticated">
                    <i class="bi bi-star"></i>
                  </button>
                  <button v-if="recipe.is_author" class="btn btn-outline-secondary" 
                          @click="$router.push({name: 'RecipeEdit', params: {id: recipe.id}})">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-if="recipe.is_author || isAdmin" class="btn btn-outline-danger" 
                          @click="deleteRecipe">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-4">
                <i class="bi bi-clock"></i> Prep: {{ recipe.prep_time }} min
              </div>
              <div class="col-md-4">
                <i class="bi bi-fire"></i> Cook: {{ recipe.cook_time }} min
              </div>
              <div class="col-md-4">
                <i class="bi bi-people"></i> Servings: {{ recipe.servings }}
              </div>
            </div>
            
            <p class="lead">{{ recipe.description }}</p>
            
            <h4 class="mt-4">Ingredients:</h4>
            <ul class="list-group list-group-flush">
              <li v-for="ingredient in recipe.ingredients_list" :key="ingredient.id" 
                  class="list-group-item">
                <input type="checkbox" class="form-check-input me-2">
                {{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.name }}
              </li>
            </ul>
            
            <h4 class="mt-4">Instructions:</h4>
            <div class="instructions" v-html="formattedInstructions"></div>
          </div>
        </div>
        
        <!-- Comments Section -->
        <div class="card mt-4 shadow-sm">
          <div class="card-body">
            <h4>Comments ({{ recipe.comments?.length || 0 }})</h4>
            
            <div v-if="isAuthenticated" class="mb-3">
              <form @submit.prevent="addComment">
                <div class="input-group">
                  <input type="text" class="form-control" v-model="newComment" 
                         placeholder="Add a comment..." required>
                  <button class="btn btn-primary" type="submit">
                    <i class="bi bi-send"></i>
                  </button>
                </div>
              </form>
            </div>
            
            <div v-for="comment in recipe.comments" :key="comment.id" class="border-bottom py-3">
              <div class="d-flex justify-content-between">
                <div>
                  <strong>{{ comment.user }}</strong>
                  <small class="text-muted ms-2">{{ formatDate(comment.created_at) }}</small>
                </div>
                <div v-if="comment.user_id === currentUser?.id">
                  <button class="btn btn-sm btn-link text-danger" @click="deleteComment(comment.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p class="mb-0 mt-2">{{ comment.text }}</p>
            </div>
            
            <div v-if="!recipe.comments?.length" class="text-center text-muted py-3">
              No comments yet. Be the first to comment!
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5>Recipe Information</h5>
            <hr>
            <p><i class="bi bi-calendar"></i> Created: {{ formatDate(recipe.created_at) }}</p>
            <p><i class="bi bi-clock-history"></i> Updated: {{ formatDate(recipe.updated_at) }}</p>
            <p><i class="bi bi-person"></i> Author: {{ recipe.author }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Rating Modal -->
    <div v-if="showRateModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate Recipe</h5>
            <button type="button" class="btn-close" @click="showRateModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <div class="rating-stars">
              <i v-for="star in 5" :key="star"
                 class="bi bi-star-fill fs-2 mx-1"
                 :class="star <= selectedRating ? 'text-warning' : 'text-muted'"
                 @click="selectedRating = star"
                 style="cursor: pointer;">
              </i>
            </div>
            <p class="mt-3">Your rating: {{ selectedRating }} star{{ selectedRating !== 1 ? 's' : '' }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRateModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="rateRecipe">Submit Rating</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="container">
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeDetail',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const recipe = ref(null)
    const showRateModal = ref(false)
    const selectedRating = ref(5)
    const newComment = ref('')
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const currentUser = computed(() => store.getters.currentUser)
    const isAdmin = computed(() => store.getters.isAdmin)
    const isFavorited = computed(() => recipe.value?.is_favorited || false)
    
    const formattedInstructions = computed(() => {
      if (!recipe.value?.instructions) return ''
      return recipe.value.instructions.split('\n').map(line => `<p>${line}</p>`).join('')
    })
    
    const fetchRecipe = async () => {
      try {
        const response = await apiService.getRecipe(route.params.id)
        recipe.value = response.data
        if (recipe.value.user_rating) {
          selectedRating.value = recipe.value.user_rating
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
        router.push({ name: 'RecipeList' })
      }
    }
    
    const toggleFavorite = async () => {
      if (!isAuthenticated.value) return
      
      try {
        if (isFavorited.value) {
          await apiService.removeFavorite(recipe.value.id)
          recipe.value.is_favorited = false
        } else {
          await apiService.addFavorite(recipe.value.id)
          recipe.value.is_favorited = true
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    }
    
    const rateRecipe = async () => {
      try {
        await apiService.rateRecipe(recipe.value.id, selectedRating.value)
        showRateModal.value = false
        await fetchRecipe()
      } catch (error) {
        console.error('Error rating recipe:', error)
      }
    }
    
    const addComment = async () => {
      if (!newComment.value.trim()) return
      
      try {
        await apiService.addComment(recipe.value.id, newComment.value)
        newComment.value = ''
        await fetchRecipe()
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    }
    
    const deleteComment = async (commentId) => {
      if (!confirm('Are you sure you want to delete this comment?')) return
      
      try {
        await apiService.deleteComment(commentId)
        await fetchRecipe()
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    }
    
    const deleteRecipe = async () => {
      if (!confirm('Are you sure you want to delete this recipe?')) return
      
      try {
        await apiService.deleteRecipe(recipe.value.id)
        router.push({ name: 'RecipeList' })
      } catch (error) {
        console.error('Error deleting recipe:', error)
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }
    
    onMounted(fetchRecipe)
    
    return {
      recipe,
      showRateModal,
      selectedRating,
      newComment,
      isAuthenticated,
      currentUser,
      isAdmin,
      isFavorited,
      formattedInstructions,
      toggleFavorite,
      rateRecipe,
      addComment,
      deleteComment,
      deleteRecipe,
      formatDate
    }
  }
}
</script>

<style scoped>
.instructions {
  line-height: 1.8;
}

.rating-stars i {
  transition: all 0.2s ease;
}

.rating-stars i:hover {
  transform: scale(1.2);
}
</style>
