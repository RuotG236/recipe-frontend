<template>
  <div class="admin-recipes container">
    <h2 class="mb-4"><i class="bi bi-journal-text"></i> Manage Recipes</h2>

    <div class="mb-3">
      <input type="text" class="form-control" v-model="searchQuery"
             placeholder="Search recipes..." @input="filterRecipes">
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
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
                <td>{{ recipe.title }}</td>
                <td>{{ recipe.author }}</td>
                <td>{{ recipe.category_name || 'None' }}</td>
                <td>
                  <i class="bi bi-star-fill text-warning"></i>
                  {{ recipe.average_rating || 0 }}
                </td>
                <td>{{ recipe.comments?.length || 0 }}</td>
                <td>{{ formatDate(recipe.created_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}"
                                 class="btn btn-outline-primary">
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link :to="{name: 'RecipeEdit', params: {id: recipe.id}}"
                                 class="btn btn-outline-secondary">
                      <i class="bi bi-pencil"></i>
                    </router-link>
                    <button class="btn btn-outline-danger" @click="deleteRecipe(recipe.id)">
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

    const filteredRecipes = computed(() => {
      if (!searchQuery.value) return recipes.value

      const query = searchQuery.value.toLowerCase()
      return recipes.value.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.author.toLowerCase().includes(query) ||
        recipe.category_name?.toLowerCase().includes(query)
      )
    })

    const fetchRecipes = async () => {
      try {
        const response = await apiService.getAdminRecipes()
        recipes.value = response.data
      } catch (error) {
        console.error('Error fetching recipes:', error)
      }
    }

    const deleteRecipe = async (id) => {
      if (!confirm('Are you sure you want to delete this recipe?')) return

      try {
        await apiService.deleteAdminRecipe(id)
        await fetchRecipes()
      } catch (error) {
        console.error('Error deleting recipe:', error)
        alert('Failed to delete recipe')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const filterRecipes = () => {
      // Triggered by input event
    }

    onMounted(fetchRecipes)

    return {
      recipes,
      searchQuery,
      filteredRecipes,
      deleteRecipe,
      formatDate,
      filterRecipes
    }
  }
}
</script>

<style scoped>
.table {
  margin-bottom: 0;
}
.btn-group {
  display: flex;
  gap: 2px;
}
</style>