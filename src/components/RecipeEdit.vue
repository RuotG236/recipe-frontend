<template>
  <div class="recipe-edit container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">Edit Recipe</h2>

            <form @submit.prevent="updateRecipe">
              <div class="mb-3">
                <label class="form-label">Title *</label>
                <input type="text" class="form-control" v-model="recipe.title" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="recipe.category">
                  <option :value="null">-- Select Category --</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Prep Time (minutes)</label>
                  <input type="number" class="form-control" v-model.number="recipe.prep_time" min="0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cook Time (minutes)</label>
                  <input type="number" class="form-control" v-model.number="recipe.cook_time" min="0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Servings</label>
                  <input type="number" class="form-control" v-model.number="recipe.servings" min="1">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" v-model="recipe.description" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Ingredients (one per line)</label>
                <textarea class="form-control" rows="6" v-model="recipe.ingredients"
                          placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Instructions</label>
                <textarea class="form-control" rows="8" v-model="recipe.instructions" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Image URL</label>
                <input type="url" class="form-control" v-model="recipe.image_url"
                       placeholder="https://example.com/image.jpg">
              </div>

              <div class="d-flex justify-content-between">
                <router-link :to="{name: 'RecipeDetail', params: {id: recipeId}}"
                             class="btn btn-secondary">Cancel</router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Update Recipe
                </button>
              </div>
            </form>

            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'RecipeEdit',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const recipeId = route.params.id

    const recipe = ref({
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

    const fetchRecipe = async () => {
      try {
        const response = await apiService.getRecipe(recipeId)
        const data = response.data

        // Check authorization
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (data.author !== currentUser.username && !currentUser.is_staff) {
          router.push({ name: 'RecipeDetail', params: { id: recipeId } })
          return
        }

        // Format ingredients for editing
        let ingredientsText = ''
        if (data.ingredients_list && data.ingredients_list.length > 0) {
          ingredientsText = data.ingredients_list
            .map(i => {
              const parts = []
              if (i.quantity) parts.push(i.quantity)
              if (i.unit) parts.push(i.unit)
              if (i.name) parts.push(i.name)
              return parts.join(' ')
            })
            .join('\n')
        } else if (data.ingredients) {
          ingredientsText = data.ingredients
        }

        recipe.value = {
          title: data.title || '',
          description: data.description || '',
          ingredients: ingredientsText,
          instructions: data.instructions || '',
          category: data.category,
          prep_time: data.prep_time || 0,
          cook_time: data.cook_time || 0,
          servings: data.servings || 4,
          image_url: data.image_url || ''
        }
      } catch (err) {
        console.error('Error fetching recipe:', err)
        error.value = 'Failed to load recipe'
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        categories.value = response.data
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    const updateRecipe = async () => {
      loading.value = true
      error.value = null

      try {
        await apiService.updateRecipe(recipeId, recipe.value)
        router.push({ name: 'RecipeDetail', params: { id: recipeId } })
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to update recipe'
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCategories()
      fetchRecipe()
    })

    return {
      recipeId,
      recipe,
      categories,
      loading,
      error,
      updateRecipe
    }
  }
}
</script>

<style scoped>
.card {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>