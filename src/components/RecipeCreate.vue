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

              <!-- Category -->
              <div class="mb-3">
                <label class="form-label">Category <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  :class="{ 'is-invalid': errors.category }"
                  v-model="recipe.category"
                  required
                >
                  <option :value="null" disabled>-- Select Category --</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <div v-if="errors.category" class="invalid-feedback">{{ errors.category }}</div>
              </div>

              <!-- Time and Servings Row -->
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Prep Time (minutes) <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.prep_time }"
                    v-model.number="recipe.prep_time" 
                    min="0"
                    max="1440"
                    placeholder="e.g., 15"
                    required
                  >
                  <div v-if="errors.prep_time" class="invalid-feedback">{{ errors.prep_time }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cook Time (minutes) <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.cook_time }"
                    v-model.number="recipe.cook_time" 
                    min="0"
                    max="1440"
                    placeholder="e.g., 30"
                    required
                  >
                  <div v-if="errors.cook_time" class="invalid-feedback">{{ errors.cook_time }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Servings <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.servings }"
                    v-model.number="recipe.servings" 
                    min="1"
                    max="100"
                    placeholder="e.g., 4"
                    required
                  >
                  <div v-if="errors.servings" class="invalid-feedback">{{ errors.servings }}</div>
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
                  placeholder="Briefly describe your recipe..."
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
              </div>

              <!-- Ingredients -->
              <div class="mb-3">
                <label class="form-label">Ingredients <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.ingredients }"
                  rows="6" 
                  v-model="recipe.ingredients"
                  placeholder="Enter one ingredient per line:&#10;2 cups flour&#10;1 cup sugar&#10;3 large eggs&#10;1/2 tsp salt"
                  required
                ></textarea>
                <small class="text-muted">Enter one ingredient per line</small>
                <div v-if="errors.ingredients" class="invalid-feedback">{{ errors.ingredients }}</div>
              </div>

              <!-- Instructions -->
              <div class="mb-3">
                <label class="form-label">Instructions/Steps <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.instructions }"
                  rows="8" 
                  v-model="recipe.instructions"
                  placeholder="Write step-by-step instructions:&#10;1. Preheat oven to 350°F&#10;2. Mix dry ingredients in a large bowl&#10;3. Add wet ingredients and stir until combined&#10;4. Pour into baking pan and bake for 30 minutes"
                  required
                ></textarea>
                <small class="text-muted">Provide clear, step-by-step cooking instructions</small>
                <div v-if="errors.instructions" class="invalid-feedback">{{ errors.instructions }}</div>
              </div>

              <!-- Image URL -->
              <div class="mb-4">
                <label class="form-label">Image URL (optional)</label>
                <input 
                  type="url" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.image_url }"
                  v-model="recipe.image_url"
                  placeholder="https://example.com/image.jpg"
                >
                <small class="text-muted">Paste a URL to an image of your dish</small>
                <div v-if="errors.image_url" class="invalid-feedback">{{ errors.image_url }}</div>
                
                <!-- Image Preview -->
                <div v-if="recipe.image_url && isValidUrl(recipe.image_url)" class="mt-2">
                  <img 
                    :src="recipe.image_url" 
                    alt="Preview" 
                    class="img-thumbnail" 
                    style="max-height: 150px;"
                    @error="imageError = true"
                    @load="imageError = false"
                  >
                  <p v-if="imageError" class="text-warning small mt-1">
                    <i class="bi bi-exclamation-triangle"></i> Unable to load image preview
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex justify-content-between">
                <router-link :to="{name: 'RecipeList'}" class="btn btn-secondary">
                  <i class="bi bi-x-lg"></i> Cancel
                </router-link>
                <button type="submit" class="btn btn-success" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg"></i>
                  {{ loading ? 'Creating...' : 'Create Recipe' }}
                </button>
              </div>
            </form>

            <!-- Success/Error Messages -->
            <div v-if="success" class="alert alert-success mt-3">
              <i class="bi bi-check-circle"></i> {{ success }}
            </div>
            <div v-if="error" class="alert alert-danger mt-3">
              <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
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
      prep_time: 0,
      cook_time: 0,
      servings: 4,
      image_url: ''
    })

    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)
    const imageError = ref(false)
    const errors = reactive({
      title: null,
      description: null,
      ingredients: null,
      instructions: null,
      category: null,
      prep_time: null,
      cook_time: null,
      servings: null,
      image_url: null
    })

    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        categories.value = response.data
      } catch (err) {
        console.error('Error fetching categories:', err)
        categories.value = [
          { id: 1, name: 'Breakfast' },
          { id: 2, name: 'Lunch' },
          { id: 3, name: 'Dinner' },
          { id: 4, name: 'Dessert' }
        ]
      }
    }

    const validateForm = () => {
      let isValid = true
      Object.keys(errors).forEach(key => errors[key] = null)

      if (!recipe.title || recipe.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters'
        isValid = false
      }

      if (!recipe.category) {
        errors.category = 'Please select a category'
        isValid = false
      }

      if (!recipe.description || recipe.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters'
        isValid = false
      }

      if (!recipe.ingredients || recipe.ingredients.trim().length < 5) {
        errors.ingredients = 'Please add at least one ingredient'
        isValid = false
      }

      if (!recipe.instructions || recipe.instructions.trim().length < 20) {
        errors.instructions = 'Instructions must be at least 20 characters'
        isValid = false
      }

      if (recipe.prep_time < 0 || recipe.prep_time > 1440) {
        errors.prep_time = 'Prep time must be between 0 and 1440 minutes'
        isValid = false
      }

      if (recipe.cook_time < 0 || recipe.cook_time > 1440) {
        errors.cook_time = 'Cook time must be between 0 and 1440 minutes'
        isValid = false
      }

      if (recipe.servings < 1 || recipe.servings > 100) {
        errors.servings = 'Servings must be between 1 and 100'
        isValid = false
      }

      if (recipe.image_url && !isValidUrl(recipe.image_url)) {
        errors.image_url = 'Please enter a valid URL'
        isValid = false
      }

      return isValid
    }

    const isValidUrl = (string) => {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    }

    const createRecipe = async () => {
      error.value = null
      success.value = null

      if (!validateForm()) {
        error.value = 'Please fix the errors above before submitting'
        return
      }

      loading.value = true

      try {
        const recipeData = {
          title: recipe.title.trim(),
          description: recipe.description.trim(),
          ingredients: recipe.ingredients.trim(),
          instructions: recipe.instructions.trim(),
          category: recipe.category,
          prep_time: recipe.prep_time || 0,
          cook_time: recipe.cook_time || 0,
          servings: recipe.servings || 4,
          image_url: recipe.image_url.trim() || ''
        }

        await apiService.createRecipe(recipeData)
        success.value = 'Recipe created successfully! Redirecting...'
        
        setTimeout(() => {
          router.push({ name: 'MyRecipes' })
        }, 1500)
      } catch (err) {
        console.error('Error creating recipe:', err)
        if (err.response?.data) {
          const backendErrors = err.response.data
          if (typeof backendErrors === 'object') {
            Object.keys(backendErrors).forEach(key => {
              if (errors.hasOwnProperty(key)) {
                errors[key] = Array.isArray(backendErrors[key]) 
                  ? backendErrors[key].join(', ') 
                  : backendErrors[key]
              }
            })
            error.value = 'Please fix the errors above'
          } else {
            error.value = backendErrors
          }
        } else {
          error.value = 'Failed to create recipe. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchCategories)

    return {
      recipe,
      categories,
      loading,
      error,
      success,
      errors,
      imageError,
      createRecipe,
      isValidUrl
    }
  }
}
</script>

<style scoped>
.card {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.form-label {
  font-weight: 500;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}

textarea {
  resize: vertical;
}

.img-thumbnail {
  max-width: 200px;
}
</style>
