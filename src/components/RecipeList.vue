<template>
  <div class="recipe-list container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Browse Recipes</h2>
      <router-link :to="{name: 'RecipeCreate'}" class="btn btn-primary" v-if="isAuthenticated">
        <font-awesome-icon icon="plus" /> Add Recipe
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <input type="text" class="form-control" placeholder="Search recipes..." v-model="searchQuery">
    </div>

    <!-- Category Filter -->
    <div class="mb-4">
      <button class="btn me-2" :class="selectedCategory === 'All' ? 'btn-dark' : 'btn-outline-secondary'" @click="filterCategory('All')">All</button>
      <button class="btn me-2" :class="selectedCategory === 'Breakfast' ? 'btn-dark' : 'btn-outline-secondary'" @click="filterCategory('Breakfast')">Breakfast</button>
      <button class="btn me-2" :class="selectedCategory === 'Lunch' ? 'btn-dark' : 'btn-outline-secondary'" @click="filterCategory('Lunch')">Lunch</button>
      <button class="btn me-2" :class="selectedCategory === 'Dinner' ? 'btn-dark' : 'btn-outline-secondary'" @click="filterCategory('Dinner')">Dinner</button>
      <button class="btn me-2" :class="selectedCategory === 'Dessert' ? 'btn-dark' : 'btn-outline-secondary'" @click="filterCategory('Dessert')">Dessert</button>
    </div>

    <!-- Recipe Grid -->
    <div class="row">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
            <span class="text-muted">[Image]</span>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="text-muted small">
              <font-awesome-icon icon="star" class="text-warning" />
              {{ recipe.rating || 'No ratings' }} | {{ recipe.category_name || 'Uncategorized' }}
            </p>
            <router-link :to="{name: 'RecipeDetail', params: {id: recipe.id}}" class="btn btn-sm btn-primary">View Recipe</router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredRecipes.length === 0" class="alert alert-info text-center">
      No recipes found. <span v-if="isAuthenticated">Be the first to add one!</span>
    </div>
  </div>
</template>

<script>
import { APIService } from '../http/APIService'
const apiService = new APIService()

export default {
  name: 'RecipeList',
  data() {
    return {
      recipes: [],
      isAuthenticated: false,
      searchQuery: '',
      selectedCategory: 'All'
    }
  },
  computed: {
    filteredRecipes() {
      let filtered = this.recipes

      if (this.selectedCategory !== 'All') {
        filtered = filtered.filter(r => r.category_name === this.selectedCategory)
      }

      if (this.searchQuery) {
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }

      return filtered
    }
  },
  mounted() {
    this.isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated") || "false")
    this.getRecipes()
  },
  methods: {
    getRecipes() {
      apiService.getRecipes().then(response => {
        this.recipes = response.data
      }).catch(error => {
        console.error(error)
      })
    },
    filterCategory(category) {
      this.selectedCategory = category
    }
  }
}
</script>