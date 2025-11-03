<template>
  <div class="my-recipes container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>My Recipes</h2>
      <router-link :to="{name: 'RecipeCreate'}" class="btn btn-primary">
        + New Recipe
      </router-link>
    </div>

    <div v-for="recipe in myRecipes" :key="recipe.id" class="card mb-3">
      <div class="card-body d-flex">
        <div class="bg-light d-flex align-items-center justify-content-center me-3" style="width: 100px; height: 100px;">
          <span class="text-muted">[Img]</span>
        </div>
        <div class="flex-grow-1">
          <h5>{{ recipe.title }}</h5>
          <p class="text-muted small">{{ recipe.category_name }} | Created {{ formatDate(recipe.created_at) }}</p>
        </div>
        <div class="d-flex flex-column">
          <button class="btn btn-sm btn-secondary mb-2" @click="viewRecipe(recipe.id)">View</button>
          <button class="btn btn-sm btn-outline-secondary mb-2" @click="editRecipe(recipe.id)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="deleteRecipe(recipe.id)">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="myRecipes.length === 0" class="alert alert-info text-center">
      You haven't created any recipes yet.
    </div>
  </div>
</template>

<script>
import { APIService } from '../http/APIService'
const apiService = new APIService()

export default {
  name: 'MyRecipes',
  data() {
    return {
      myRecipes: []
    }
  },
  mounted() {
    this.getMyRecipes()
  },
  methods: {
    getMyRecipes() {
      const username = localStorage.getItem('username')
      apiService.getRecipes().then(response => {
        this.myRecipes = response.data.filter(r => r.author === username)
      })
    },
    viewRecipe(id) {
      this.$router.push({name: 'RecipeDetail', params: {id}})
    },
    editRecipe(id) {
      this.$router.push({name: 'RecipeEdit', params: {id}})
    },
    deleteRecipe(id) {
      if (confirm('Are you sure you want to delete this recipe?')) {
        // Delete logic here
        this.getMyRecipes()
      }
    },
    formatDate(date) {
      const d = new Date(date)
      const now = new Date()
      const diffTime = Math.abs(now - d)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 14) return '1 week ago'
      return `${Math.floor(diffDays / 7)} weeks ago`
    }
  }
}
</script>