<template>
  <div class="home container mt-5">
    <div class="text-center mb-5">
      <h1 class="display-4">RecipeBook</h1>
      <p class="lead">Discover, save, share, and manage recipes</p>
    </div>

    <div class="row mt-5">
      <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h3 class="card-title">Browse Recipes</h3>
            <p class="card-text">Explore our collection of delicious recipes</p>
            <router-link :to="{name: 'RecipeList'}" class="btn btn-primary">Browse</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4" v-if="isAuthenticated">
        <div class="card text-center h-100">
          <div class="card-body">
            <h3 class="card-title">My Recipes</h3>
            <p class="card-text">View and manage your recipes</p>
            <router-link :to="{name: 'MyRecipes'}" class="btn btn-primary">View</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4" v-if="isAuthenticated">
        <div class="card text-center h-100">
          <div class="card-body">
            <h3 class="card-title">Favorites</h3>
            <p class="card-text">Access your saved favorite recipes</p>
            <router-link :to="{name: 'Favorites'}" class="btn btn-primary">View</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isAuthenticated: false
    }
  },
  mounted() {
    this.isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated") || "false")
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>