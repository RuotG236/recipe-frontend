<template>
  <div class="container mt-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Loading recipe...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <router-link :to="{name: 'RecipeList'}" class="btn btn-primary ms-3">Back to Recipes</router-link>
    </div>

    <!-- Recipe Content -->
    <div v-else-if="recipe" class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <!-- Image -->
          <div class="bg-light d-flex align-items-center justify-content-center" style="height: 300px;">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" 
                 class="img-fluid" style="max-height: 300px; object-fit: cover;">
            <i v-else class="bi bi-image text-muted" style="font-size: 4rem;"></i>
          </div>

          <div class="card-body">
            <!-- Title & Actions -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1>{{ recipe.title }}</h1>
                <span class="badge bg-secondary">{{ recipe.category_name || 'Uncategorized' }}</span>
              </div>
              <div v-if="isAuthenticated">
                <button class="btn btn-outline-danger me-2" @click="toggleFavorite">
                  <i :class="recipe.is_favorited ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </button>
                <button class="btn btn-outline-warning me-2" @click="showRateModal = true">
                  <i class="bi bi-star"></i> Rate
                </button>
                <router-link v-if="isAuthor" :to="{name: 'RecipeEdit', params: {id: recipe.id}}" class="btn btn-outline-secondary me-2">
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button v-if="isAuthor" class="btn btn-outline-danger" @click="deleteRecipe">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Rating -->
            <div class="mb-3">
              <span class="text-warning">
                <i v-for="n in 5" :key="n" :class="n <= Math.round(recipe.average_rating || 0) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
              </span>
              <strong class="ms-2">{{ (recipe.average_rating || 0).toFixed(1) }}</strong>
              <span class="text-muted">({{ recipe.total_ratings || 0 }} ratings)</span>
            </div>

            <!-- Time Info -->
            <div class="row mb-3 text-muted small">
              <div class="col-auto"><i class="bi bi-clock"></i> Prep: {{ recipe.prep_time || 0 }}min</div>
              <div class="col-auto"><i class="bi bi-fire"></i> Cook: {{ recipe.cook_time || 0 }}min</div>
              <div class="col-auto"><i class="bi bi-people"></i> Serves: {{ recipe.servings || 4 }}</div>
            </div>

            <!-- Description -->
            <p class="lead">{{ recipe.description }}</p>

            <!-- Ingredients -->
            <h4 class="mt-4"><i class="bi bi-list-check"></i> Ingredients</h4>
            <ul class="list-group list-group-flush mb-4">
              <li v-for="(ing, i) in ingredientsList" :key="i" class="list-group-item">
                <input type="checkbox" class="form-check-input me-2"> {{ ing }}
              </li>
              <li v-if="ingredientsList.length === 0" class="list-group-item text-muted">No ingredients listed</li>
            </ul>

            <!-- Instructions -->
            <h4><i class="bi bi-journal-text"></i> Instructions</h4>
            <div v-if="recipe.instructions">
              <p v-for="(step, i) in instructionsList" :key="i">{{ step }}</p>
            </div>
            <p v-else class="text-muted">No instructions provided</p>
          </div>
        </div>

        <!-- Comments -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h4><i class="bi bi-chat-dots"></i> Comments</h4>
            
            <div v-if="isAuthenticated" class="mb-3">
              <div class="input-group">
                <input type="text" class="form-control" v-model="newComment" placeholder="Add comment...">
                <button class="btn btn-primary" @click="addComment" :disabled="!newComment.trim()">Send</button>
              </div>
            </div>

            <div v-for="comment in (recipe.comments || [])" :key="comment.id" class="border-bottom py-2">
              <strong>{{ comment.user }}</strong>
              <small class="text-muted ms-2">{{ formatDate(comment.created_at) }}</small>
              <p class="mb-0">{{ comment.text }}</p>
            </div>
            <p v-if="!recipe.comments?.length" class="text-muted">No comments yet</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5>Recipe Info</h5>
            <hr>
            <p><i class="bi bi-person"></i> By: {{ recipe.author }}</p>
            <p><i class="bi bi-calendar"></i> {{ formatDate(recipe.created_at) }}</p>
          </div>
        </div>
        <router-link :to="{name: 'RecipeList'}" class="btn btn-outline-secondary w-100">
          <i class="bi bi-arrow-left"></i> Back to Recipes
        </router-link>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRateModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Rate Recipe</h5>
            <button class="btn-close" @click="showRateModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <div class="mb-3">
              <i v-for="star in 5" :key="star" 
                 class="bi fs-2 mx-1" style="cursor: pointer;"
                 :class="star <= (hoverRating || selectedRating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'"
                 @click="selectedRating = star"
                 @mouseenter="hoverRating = star"
                 @mouseleave="hoverRating = 0">
              </i>
            </div>
            <textarea class="form-control" v-model="ratingComment" rows="2" placeholder="Optional comment..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showRateModal = false">Cancel</button>
            <button class="btn btn-primary" @click="submitRating" :disabled="!selectedRating">Submit</button>
          </div>
        </div>
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
    const loading = ref(true)
    const error = ref(null)
    const newComment = ref('')
    
    const showRateModal = ref(false)
    const selectedRating = ref(0)
    const hoverRating = ref(0)
    const ratingComment = ref('')

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const currentUser = computed(() => store.getters.currentUser)
    const isAuthor = computed(() => {
      if (!recipe.value || !currentUser.value) return false
      return recipe.value.author === currentUser.value.username
    })

    const ingredientsList = computed(() => {
      if (!recipe.value?.ingredients) return []
      return recipe.value.ingredients.split('\n').filter(l => l.trim())
    })

    const instructionsList = computed(() => {
      if (!recipe.value?.instructions) return []
      return recipe.value.instructions.split('\n').filter(l => l.trim())
    })

    const fetchRecipe = async () => {
      loading.value = true
      try {
        const response = await apiService.getRecipe(route.params.id)
        recipe.value = response.data
        console.log('Recipe loaded:', response.data)
      } catch (err) {
        console.error('Error:', err)
        error.value = err.response?.status === 404 ? 'Recipe not found' : 'Failed to load recipe'
      } finally {
        loading.value = false
      }
    }

    const toggleFavorite = async () => {
      try {
        if (recipe.value.is_favorited) {
          await apiService.removeFavorite(recipe.value.id)
          recipe.value.is_favorited = false
        } else {
          await apiService.addFavorite(recipe.value.id)
          recipe.value.is_favorited = true
        }
      } catch (err) {
        console.error('Favorite error:', err)
      }
    }

    const submitRating = async () => {
      try {
        await apiService.rateRecipe(recipe.value.id, selectedRating.value, ratingComment.value)
        showRateModal.value = false
        await fetchRecipe()
      } catch (err) {
        console.error('Rating error:', err)
      }
    }

    const addComment = async () => {
      if (!newComment.value.trim()) return
      try {
        await apiService.addComment(recipe.value.id, newComment.value)
        newComment.value = ''
        await fetchRecipe()
      } catch (err) {
        console.error('Comment error:', err)
      }
    }

    const deleteRecipe = async () => {
      if (!confirm('Delete this recipe?')) return
      try {
        await apiService.deleteRecipe(recipe.value.id)
        router.push({ name: 'RecipeList' })
      } catch (err) {
        console.error('Delete error:', err)
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }

    onMounted(fetchRecipe)

    return {
      recipe, loading, error, newComment,
      showRateModal, selectedRating, hoverRating, ratingComment,
      isAuthenticated, currentUser, isAuthor,
      ingredientsList, instructionsList,
      toggleFavorite, submitRating, addComment, deleteRecipe, formatDate
    }
  }
}
</script>
