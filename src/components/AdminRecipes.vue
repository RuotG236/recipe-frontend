<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-journal-text"></i> Manage Recipes</h2>
      <router-link :to="{name: 'AdminDashboard'}" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Back to Dashboard
      </router-link>
    </div>

    <!-- Search -->
    <div class="mb-3">
      <input type="text" class="form-control" v-model="searchQuery" 
             placeholder="Search by title, author, or category...">
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Loading recipes...</p>
    </div>

    <!-- Recipes Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="recipe in filteredRecipes" :key="recipe.id">
                <td>{{ recipe.id }}</td>
                <td><strong>{{ recipe.title }}</strong></td>
                <td>{{ recipe.author }}</td>
                <td>{{ recipe.category_name || 'None' }}</td>
                <td>
                  <i class="bi bi-star-fill text-warning"></i>
                  {{ (recipe.average_rating || 0).toFixed(1) }}
                </td>
                <td>{{ recipe.comments?.length || 0 }}</td>
                <td>{{ formatDate(recipe.created_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}"
                                 class="btn btn-outline-primary" title="View">
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link :to="{name: 'RecipeEdit', params: {id: recipe.id}}"
                                 class="btn btn-outline-secondary" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </router-link>
                    <button class="btn btn-outline-danger" @click="deleteRecipe(recipe.id)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredRecipes.length === 0" class="text-center py-4">
          <p class="text-muted">No recipes found</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import apiService from '@/http/APIService'

export default {
  name: 'AdminRecipes',
  setup() {
    const recipes = ref([])
    const searchQuery = ref('')
    const loading = ref(true)
    const success = ref(null)
    const error = ref(null)

    const filteredRecipes = computed(() => {
      if (!searchQuery.value) return recipes.value

      const query = searchQuery.value.toLowerCase()
      return recipes.value.filter(recipe =>
        recipe.title?.toLowerCase().includes(query) ||
        recipe.author?.toLowerCase().includes(query) ||
        recipe.category_name?.toLowerCase().includes(query)
      )
    })

    const fetchRecipes = async () => {
      loading.value = true
      try {
        const response = await apiService.getAdminRecipes()
        recipes.value = response.data.results || response.data || []
      } catch (err) {
        console.error('Error fetching recipes:', err)
        error.value = 'Failed to load recipes'
      } finally {
        loading.value = false
      }
    }

    const deleteRecipe = async (id) => {
      if (!confirm('Are you sure you want to delete this recipe?')) return

      try {
        await apiService.deleteAdminRecipe(id)
        recipes.value = recipes.value.filter(r => r.id !== id)
        success.value = 'Recipe deleted successfully'
        setTimeout(() => success.value = null, 3000)
      } catch (err) {
        console.error('Error deleting recipe:', err)
        error.value = 'Failed to delete recipe'
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(fetchRecipes)

    return {
      recipes,
      searchQuery,
      loading,
      success,
      error,
      filteredRecipes,
      deleteRecipe,
      formatDate
    }
  }
}
</script>
