<template>
  <div v-if="recipe" class="recipe-detail container">
    <div class="row">
      <!-- Main Content -->
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <!-- Recipe Image -->
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 300px; overflow: hidden;">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" class="img-fluid" style="object-fit: cover; width: 100%; height: 100%;">
            <span v-else class="text-muted"><i class="bi bi-image" style="font-size: 4rem;"></i></span>
          </div>
          
          <div class="card-body">
            <!-- Title and Actions -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 class="card-title">{{ recipe.title }}</h1>
                <span class="badge bg-secondary">{{ recipe.category_name || 'Uncategorized' }}</span>
              </div>
              <div class="btn-group" v-if="isAuthenticated">
                <button class="btn btn-outline-danger" @click="toggleFavorite">
                  <i :class="isFavorited ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </button>
                <button class="btn btn-outline-warning" @click="showRateModal = true">
                  <i class="bi bi-star-fill"></i> Rate
                </button>
                <router-link v-if="canEdit" :to="{name: 'RecipeEdit', params: {id: recipe.id}}" class="btn btn-outline-secondary">
                  <i class="bi bi-pencil"></i> Edit
                </router-link>
                <button v-if="canEdit" class="btn btn-outline-danger" @click="deleteRecipe">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            
            <!-- Rating Display -->
            <div class="mb-3">
              <i class="bi bi-star-fill text-warning"></i>
              <strong>{{ recipe.average_rating || 0 }}</strong>
              <span class="text-muted">({{ recipe.total_ratings || 0 }} ratings)</span>
            </div>
            
            <!-- Time Info -->
            <div class="row mb-3 text-muted">
              <div class="col-auto">
                <i class="bi bi-clock"></i> Prep: {{ recipe.prep_time }} min
              </div>
              <div class="col-auto">
                <i class="bi bi-fire"></i> Cook: {{ recipe.cook_time }} min
              </div>
              <div class="col-auto">
                <i class="bi bi-hourglass-split"></i> Total: {{ recipe.prep_time + recipe.cook_time }} min
              </div>
              <div class="col-auto">
                <i class="bi bi-people"></i> Servings: {{ recipe.servings }}
              </div>
            </div>
            
            <p class="lead">{{ recipe.description }}</p>
            
            <!-- Ingredients -->
            <h4 class="mt-4"><i class="bi bi-list-check"></i> Ingredients</h4>
            <ul class="list-group list-group-flush mb-4">
              <li v-if="recipe.ingredients_list && recipe.ingredients_list.length > 0" 
                  v-for="ingredient in recipe.ingredients_list" :key="ingredient.id" 
                  class="list-group-item">
                <input type="checkbox" class="form-check-input me-2">
                {{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.name }}
                <span v-if="ingredient.notes" class="text-muted">({{ ingredient.notes }})</span>
              </li>
              <li v-else-if="recipe.ingredients" v-for="(line, index) in recipe.ingredients.split('\n')" :key="index" class="list-group-item">
                <input type="checkbox" class="form-check-input me-2">
                {{ line }}
              </li>
            </ul>
            
            <!-- Instructions -->
            <h4 class="mt-4"><i class="bi bi-journal-text"></i> Instructions</h4>
            <div class="instructions" v-html="formattedInstructions"></div>
          </div>
        </div>
        
        <!-- Comments Section -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h4><i class="bi bi-chat-dots"></i> Comments ({{ recipe.comments?.length || 0 }})</h4>
            
            <!-- Add Comment Form -->
            <div v-if="isAuthenticated" class="mb-4">
              <form @submit.prevent="addComment">
                <div class="input-group">
                  <input type="text" class="form-control" v-model="newComment" placeholder="Add a comment..." required>
                  <button class="btn btn-primary" type="submit" :disabled="!newComment.trim()">
                    <i class="bi bi-send"></i> Post
                  </button>
                </div>
              </form>
            </div>
            <div v-else class="alert alert-info mb-4">
              <router-link :to="{name: 'Auth'}">Login</router-link> to leave a comment.
            </div>
            
            <!-- Comments List -->
            <div v-for="comment in recipe.comments" :key="comment.id" class="border-bottom py-3">
              <div class="d-flex justify-content-between">
                <div>
                  <strong>{{ comment.user }}</strong>
                  <small class="text-muted ms-2">{{ formatDate(comment.created_at) }}</small>
                </div>
                <div v-if="comment.user_id === currentUser?.id || isAdmin">
                  <button class="btn btn-sm btn-link text-danger" @click="deleteComment(comment.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p class="mb-0 mt-2">{{ comment.text }}</p>
            </div>
            
            <div v-if="!recipe.comments?.length" class="text-center text-muted py-3">
              <i class="bi bi-chat"></i> No comments yet. Be the first to comment!
            </div>
          </div>
        </div>

        <!-- Ratings with Comments Section -->
        <div v-if="recipe.ratings && recipe.ratings.length > 0" class="card shadow-sm mb-4">
          <div class="card-body">
            <h4><i class="bi bi-star"></i> User Reviews</h4>
            <div v-for="rating in recipe.ratings" :key="rating.id" class="border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ rating.user }}</strong>
                  <span class="ms-2">
                    <i v-for="star in 5" :key="star" class="bi bi-star-fill" :class="star <= rating.rating ? 'text-warning' : 'text-muted'"></i>
                  </span>
                </div>
                <small class="text-muted">{{ formatDate(rating.created_at) }}</small>
              </div>
              <p v-if="rating.comment" class="mb-0 mt-2 text-muted fst-italic">"{{ rating.comment }}"</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5><i class="bi bi-info-circle"></i> Recipe Information</h5>
            <hr>
            <p><i class="bi bi-calendar"></i> Created: {{ formatDate(recipe.created_at) }}</p>
            <p><i class="bi bi-clock-history"></i> Updated: {{ formatDate(recipe.updated_at) }}</p>
            <p><i class="bi bi-person"></i> Author: {{ recipe.author }}</p>
          </div>
        </div>

        <!-- Back Button -->
        <router-link :to="{name: 'RecipeList'}" class="btn btn-outline-secondary w-100">
          <i class="bi bi-arrow-left"></i> Back to Recipes
        </router-link>
      </div>
    </div>
    
    <!-- Rating Modal with Comment -->
    <div v-if="showRateModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-star-fill text-warning"></i> Rate This Recipe</h5>
            <button type="button" class="btn-close" @click="closeRatingModal"></button>
          </div>
          <div class="modal-body">
            <!-- Star Rating -->
            <div class="text-center mb-4">
              <p class="text-muted mb-2">How would you rate this recipe?</p>
              <div class="rating-stars">
                <i v-for="star in 5" :key="star"
                   class="bi bi-star-fill fs-2 mx-1"
                   :class="star <= (hoverRating || selectedRating) ? 'text-warning' : 'text-muted'"
                   @click="selectedRating = star"
                   @mouseenter="hoverRating = star"
                   @mouseleave="hoverRating = 0"
                   style="cursor: pointer; transition: transform 0.2s;"
                   :style="{ transform: (hoverRating >= star || selectedRating >= star) ? 'scale(1.1)' : 'scale(1)' }">
                </i>
              </div>
              <p class="mt-2 mb-0">
                <strong>{{ ratingLabels[selectedRating - 1] || 'Select a rating' }}</strong>
              </p>
            </div>
            
            <!-- Comment Section (Optional) -->
            <div class="mb-3">
              <label class="form-label">Add a comment (optional)</label>
              <textarea 
                class="form-control" 
                v-model="ratingComment"
                rows="3"
                placeholder="What did you like about this recipe? Any tips?"
                maxlength="500"
              ></textarea>
              <small class="text-muted float-end">{{ ratingComment.length }}/500</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeRatingModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="rateRecipe" :disabled="!selectedRating || ratingLoading">
              <span v-if="ratingLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ ratingLoading ? 'Submitting...' : 'Submit Rating' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Loading State -->
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
    const selectedRating = ref(0)
    const hoverRating = ref(0)
    const ratingComment = ref('')
    const ratingLoading = ref(false)
    const newComment = ref('')
    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const currentUser = computed(() => store.getters.currentUser)
    const isAdmin = computed(() => store.getters.isAdmin)
    const isFavorited = computed(() => recipe.value?.is_favorited || false)
    const canEdit = computed(() => {
      if (!isAuthenticated.value || !recipe.value) return false
      return recipe.value.author === currentUser.value?.username || isAdmin.value
    })
    
    const formattedInstructions = computed(() => {
      if (!recipe.value?.instructions) return '<p>No instructions provided.</p>'
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
      if (!isAuthenticated.value) {
        router.push({ name: 'Auth' })
        return
      }
      
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
      if (!selectedRating.value) return
      
      ratingLoading.value = true
      
      try {
        await apiService.rateRecipe(recipe.value.id, selectedRating.value, ratingComment.value)
        closeRatingModal()
        await fetchRecipe()
      } catch (error) {
        console.error('Error rating recipe:', error)
        alert('Failed to submit rating. Please try again.')
      } finally {
        ratingLoading.value = false
      }
    }

    const closeRatingModal = () => {
      showRateModal.value = false
      ratingComment.value = ''
      hoverRating.value = 0
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
      if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) return
      
      try {
        await apiService.deleteRecipe(recipe.value.id)
        router.push({ name: 'RecipeList' })
      } catch (error) {
        console.error('Error deleting recipe:', error)
        alert('Failed to delete recipe.')
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    onMounted(fetchRecipe)
    
    return {
      recipe,
      showRateModal,
      selectedRating,
      hoverRating,
      ratingComment,
      ratingLoading,
      ratingLabels,
      newComment,
      isAuthenticated,
      currentUser,
      isAdmin,
      isFavorited,
      canEdit,
      formattedInstructions,
      toggleFavorite,
      rateRecipe,
      closeRatingModal,
      addComment,
      deleteComment,
      deleteRecipe,
      formatDate
    }
  }
}
</script>

<style scoped>
.recipe-detail {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.instructions p {
  margin-bottom: 0.5rem;
}

.rating-stars i {
  transition: all 0.2s ease;
}

.rating-stars i:hover {
  transform: scale(1.2);
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}
</style>
