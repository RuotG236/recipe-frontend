<template>
  <div class="recipe-create container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <i class="bi bi-plus-circle"></i> Create New Recipe
            </h2>

            <form @submit.prevent="createRecipe">
              <!-- Title -->
              <div class="mb-3">
                <label class="form-label">Title <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.title }"
                  v-model="recipe.title" 
                  placeholder="Enter recipe title"
                  required
                >
                <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
              </div>

              <!-- Category - Using text input instead of dropdown -->
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
                  <input type="number" class="form-control" v-model.number="recipe.prep_time" min="0" placeholder="15">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cook Time (min)</label>
                  <input type="number" class="form-control" v-model.number="recipe.cook_time" min="0" placeholder="30">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Servings</label>
                  <input type="number" class="form-control" v-model.number="recipe.servings" min="1" placeholder="4">
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label">Description <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.description }"
                  rows="3" 
                  v-model="recipe.description"
                  placeholder="Describe your recipe (at least 10 characters)"
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
              </div>

              <!-- Ingredients -->
              <div class="mb-3">
                <label class="form-label">Ingredients</label>
                <textarea 
                  class="form-control" 
                  rows="5" 
                  v-model="recipe.ingredients"
                  placeholder="Enter one ingredient per line:&#10;2 cups flour&#10;1 cup sugar&#10;3 eggs"
                ></textarea>
              </div>

              <!-- Instructions -->
              <div class="mb-3">
                <label class="form-label">Instructions</label>
                <textarea 
                  class="form-control" 
                  rows="5" 
                  v-model="recipe.instructions"
                  placeholder="Step by step instructions..."
                ></textarea>
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
                <router-link :to="{name: 'RecipeList'}" class="btn btn-secondary">Cancel</router-link>
                <button type="submit" class="btn btn-success" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Creating...' : 'Create Recipe' }}
                </button>
              </div>
            </form>

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
import { useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeCreate',
  setup() {
    const router = useRouter()
    
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
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)
    const errors = reactive({ title: null, description: null })

    // Fetch categories to get IDs
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        const cats = response.data.results || response.data || []
        cats.forEach(cat => {
          categoryMap.value[cat.name] = cat.id
        })
        console.log('Category map:', categoryMap.value)
      } catch (err) {
        console.log('Could not fetch categories, will send without category ID')
      }
    }

    const createRecipe = async () => {
      error.value = null
      success.value = null
      errors.title = null
      errors.description = null

      // Validation
      if (!recipe.title || recipe.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters'
        return
      }
      if (!recipe.description || recipe.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters'
        return
      }

      loading.value = true

      try {
        const data = {
          title: recipe.title.trim(),
          description: recipe.description.trim()
        }

        // Add optional fields
        if (recipe.ingredients) data.ingredients = recipe.ingredients.trim()
        if (recipe.instructions) data.instructions = recipe.instructions.trim()
        if (recipe.prep_time > 0) data.prep_time = recipe.prep_time
        if (recipe.cook_time > 0) data.cook_time = recipe.cook_time
        if (recipe.servings > 0) data.servings = recipe.servings
        if (recipe.image_url) data.image_url = recipe.image_url.trim()
        
        // Map category name to ID if we have the mapping
        if (recipe.category_name && categoryMap.value[recipe.category_name]) {
          data.category = categoryMap.value[recipe.category_name]
        }

        console.log('Sending:', data)
        await apiService.createRecipe(data)
        
        success.value = 'Recipe created!'
        setTimeout(() => router.push({ name: 'MyRecipes' }), 1000)
      } catch (err) {
        console.error('Error:', err.response?.data || err)
        if (err.response?.status === 401) {
          error.value = 'Please log in first'
          setTimeout(() => router.push({ name: 'Auth' }), 1500)
        } else {
          error.value = JSON.stringify(err.response?.data) || 'Failed to create recipe'
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchCategories)

    return { recipe, loading, error, success, errors, createRecipe }
  }
}
</script>

<style scoped>
.card { margin: 2rem 0; }
.is-invalid { border-color: #dc3545; }
.invalid-feedback { display: block; }
</style>
