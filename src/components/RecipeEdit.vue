<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="mb-4"><i class="bi bi-pencil"></i> Edit Recipe</h2>

            <!-- Loading -->
            <div v-if="pageLoading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">Loading recipe...</p>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="updateRecipe">
              <!-- Title -->
              <div class="mb-3">
                <label class="form-label">Title <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="recipe.title" required>
              </div>

              <!-- Category -->
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="recipe.category_name">
                  <option value="">-- Select Category --</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <!-- Time and Servings -->
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Prep Time (min)</label>
                  <input type="number" class="form-control" v-model.number="recipe.prep_time" min="0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cook Time (min)</label>
                  <input type="number" class="form-control" v-model.number="recipe.cook_time" min="0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Servings</label>
                  <input type="number" class="form-control" v-model.number="recipe.servings" min="1">
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label">Description <span class="text-danger">*</span></label>
                <textarea class="form-control" rows="3" v-model="recipe.description" required></textarea>
              </div>

              <!-- Ingredients -->
              <div class="mb-3">
                <label class="form-label">Ingredients</label>
                <textarea class="form-control" rows="5" v-model="recipe.ingredients"
                          placeholder="One ingredient per line"></textarea>
              </div>

              <!-- Instructions -->
              <div class="mb-3">
                <label class="form-label">Instructions</label>
                <textarea class="form-control" rows="5" v-model="recipe.instructions"></textarea>
              </div>

              <!-- Image URL -->
              <div class="mb-4">
                <label class="form-label">Image URL</label>
                <input type="url" class="form-control" v-model="recipe.image_url" placeholder="https://example.com/image.jpg">
                <div v-if="recipe.image_url" class="mt-2">
                  <img :src="recipe.image_url" class="img-thumbnail" style="max-height: 100px;" @error="$event.target.style.display='none'">
                </div>
              </div>

              <!-- Buttons -->
              <div class="d-flex justify-content-between">
                <router-link :to="{name: 'RecipeDetail', params: {id: recipeId}}" class="btn btn-secondary">
                  Cancel
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

            <!-- Messages -->
            <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeEdit',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const recipeId = route.params.id

    const recipe = reactive({
      title: '',
      description: '',
      ingredients: '',
      instructions: '',
      category: null,
      category_name: '',
      prep_time: 0,
      cook_time: 0,
      servings: 4,
      image_url: ''
    })

    const categoryMap = ref({})
    const pageLoading = ref(true)
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)

    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        const cats = response.data.results || response.data || []
        cats.forEach(cat => {
          categoryMap.value[cat.name] = cat.id
          // Also map ID to name for reverse lookup
          categoryMap.value[cat.id] = cat.name
        })
      } catch (err) {
        console.log('Could not fetch categories')
      }
    }

    const fetchRecipe = async () => {
      pageLoading.value = true
      try {
        const response = await apiService.getRecipe(recipeId)
        const data = response.data

        // Check authorization
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (data.author !== currentUser.username && !currentUser.is_staff) {
          router.push({ name: 'RecipeDetail', params: { id: recipeId } })
          return
        }

        // Populate form
        recipe.title = data.title || ''
        recipe.description = data.description || ''
        recipe.instructions = data.instructions || ''
        recipe.prep_time = data.prep_time || 0
        recipe.cook_time = data.cook_time || 0
        recipe.servings = data.servings || 4
        recipe.image_url = data.image_url || ''
        recipe.category = data.category
        recipe.category_name = data.category_name || ''

        // Handle ingredients
        if (data.ingredients_list && data.ingredients_list.length > 0) {
          recipe.ingredients = data.ingredients_list
            .map(i => {
              const parts = []
              if (i.quantity) parts.push(i.quantity)
              if (i.unit) parts.push(i.unit)
              if (i.name) parts.push(i.name)
              return parts.join(' ')
            })
            .join('\n')
        } else {
          recipe.ingredients = data.ingredients || ''
        }

        console.log('Recipe loaded for editing:', recipe)
      } catch (err) {
        console.error('Error fetching recipe:', err)
        error.value = 'Failed to load recipe'
      } finally {
        pageLoading.value = false
      }
    }

    const updateRecipe = async () => {
      error.value = null
      success.value = null
      loading.value = true

      try {
        const data = {
          title: recipe.title.trim(),
          description: recipe.description.trim()
        }

        if (recipe.ingredients) data.ingredients = recipe.ingredients.trim()
        if (recipe.instructions) data.instructions = recipe.instructions.trim()
        if (recipe.prep_time >= 0) data.prep_time = recipe.prep_time
        if (recipe.cook_time >= 0) data.cook_time = recipe.cook_time
        if (recipe.servings > 0) data.servings = recipe.servings
        if (recipe.image_url) data.image_url = recipe.image_url.trim()

        // Map category name to ID
        if (recipe.category_name && categoryMap.value[recipe.category_name]) {
          data.category = categoryMap.value[recipe.category_name]
        } else if (recipe.category) {
          data.category = recipe.category
        }

        console.log('Updating recipe:', data)
        await apiService.updateRecipe(recipeId, data)

        success.value = 'Recipe updated!'
        setTimeout(() => {
          router.push({ name: 'RecipeDetail', params: { id: recipeId } })
        }, 1000)
      } catch (err) {
        console.error('Update error:', err)
        error.value = err.response?.data?.detail || 'Failed to update recipe'
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await fetchCategories()
      await fetchRecipe()
    })

    return {
      recipeId,
      recipe,
      pageLoading,
      loading,
      error,
      success,
      updateRecipe
    }
  }
}
</script>

<style scoped>
.card { margin: 2rem 0; }
</style>
