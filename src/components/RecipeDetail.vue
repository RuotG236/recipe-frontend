<template>
  <div class="recipe-detail container mt-4" v-if="recipe">
    <div class="card">
      <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 300px;">
        <span class="text-muted h3">[Large Recipe Image]</span>
      </div>
      <div class="card-body">
        <h2>{{ recipe.title }}</h2>
        <p class="text-muted">
          <font-awesome-icon icon="star" class="text-warning" />
          {{ recipe.rating || 'No ratings' }} ({{ recipe.reviews || 0 }} reviews) |
          Category: {{ recipe.category_name || 'Uncategorized' }}
        </p>

        <div class="mb-3">
          <button class="btn btn-danger me-2" @click="toggleFavorite">
            <font-awesome-icon icon="heart" /> Favorite
          </button>
          <button class="btn btn-warning me-2" @click="showRateModal">
            <font-awesome-icon icon="star" /> Rate
          </button>
          <button class="btn btn-secondary" v-if="isAuthor" @click="editRecipe">
            Edit
          </button>
        </div>

        <h4>Ingredients:</h4>
        <ul class="list-unstyled">
          <li v-for="(ingredient, index) in ingredients" :key="index">
            <input type="checkbox"> {{ ingredient }}
          </li>
        </ul>

        <h4>Instructions:</h4>
        <p>{{ recipe.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { APIService } from '../http/APIService'
const apiService = new APIService()

export default {
  name: 'RecipeDetail',
  data() {
    return {
      recipe: null,
      ingredients: ['2 cups flour', '1 cup sugar', '3 eggs'],
      isAuthor: false
    }
  },
  mounted() {
    this.getRecipe()
  },
  methods: {
    getRecipe() {
      const id = this.$route.params.id
      apiService.getRecipes().then(response => {
        this.recipe = response.data.find(r => r.id == id)
        this.isAuthor = this.recipe.author === localStorage.getItem('username')
      })
    },
    toggleFavorite() {
      alert('Favorite toggled!')
    },
    showRateModal() {
      this.$router.push({name: 'RateRecipe', params: {id: this.recipe.id}})
    },
    editRecipe() {
      this.$router.push({name: 'RecipeEdit', params: {id: this.recipe.id}})
    }
  }
}
</script>