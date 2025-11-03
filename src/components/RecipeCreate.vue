<template>
  <div class="recipe-create container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Create New Recipe</h2>
            <form @submit.prevent="createRecipe">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" v-model="recipe.title" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="5" v-model="recipe.description"></textarea>
              </div>
              <button type="submit" class="btn btn-success">Create Recipe</button>
              <router-link :to="{name: 'RecipeList'}" class="btn btn-secondary ms-2">Cancel</router-link>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { APIService } from '../http/APIService'

const apiService = new APIService()

export default {
  name: 'RecipeCreate',
  data() {
    return {
      recipe: {
        title: '',
        description: ''
      },
      error: null
    }
  },
  methods: {
    createRecipe() {
      const token = localStorage.getItem("access")
      apiService.addRecipe(this.recipe, token).then(() => {
        this.$router.push({ name: 'RecipeList' })
      }).catch(error => {
        this.error = "Failed to create recipe. Please try again."
        console.error(error)
      })
    }
  }
}
</script>