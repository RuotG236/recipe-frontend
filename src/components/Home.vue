<template>
  <div class="home container mt-5">
    <div class="text-center mb-5">
      <h1 class="display-4">
        <i class="bi bi-book"></i> RecipeBook
      </h1>
      <p class="lead text-muted">Discover, save, share, and manage delicious recipes</p>
    </div>

    <div class="row mt-5 justify-content-center">
      <div class="col-md-4 mb-4">
        <div class="card text-center h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="mb-3">
              <i class="bi bi-grid-3x3-gap text-primary" style="font-size: 3rem;"></i>
            </div>
            <h3 class="card-title">Browse Recipes</h3>
            <p class="card-text flex-grow-1">Explore our collection of delicious recipes from around the world</p>
            <router-link :to="{name: 'RecipeList'}" class="btn btn-primary">
              <i class="bi bi-search"></i> Browse
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4" v-if="isAuthenticated">
        <div class="card text-center h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="mb-3">
              <i class="bi bi-journal-text text-success" style="font-size: 3rem;"></i>
            </div>
            <h3 class="card-title">My Recipes</h3>
            <p class="card-text flex-grow-1">View and manage your personal recipe collection</p>
            <router-link :to="{name: 'MyRecipes'}" class="btn btn-success">
              <i class="bi bi-list-ul"></i> View
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4" v-if="isAuthenticated">
        <div class="card text-center h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="mb-3">
              <i class="bi bi-heart text-danger" style="font-size: 3rem;"></i>
            </div>
            <h3 class="card-title">Favorites</h3>
            <p class="card-text flex-grow-1">Access your saved favorite recipes quickly</p>
            <router-link :to="{name: 'Favorites'}" class="btn btn-danger">
              <i class="bi bi-heart-fill"></i> View
            </router-link>
          </div>
        </div>
      </div>

      <!-- Show login/register cards for guests -->
      <template v-if="!isAuthenticated">
        <div class="col-md-4 mb-4">
          <div class="card text-center h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <i class="bi bi-person-plus text-success" style="font-size: 3rem;"></i>
              </div>
              <h3 class="card-title">Get Started</h3>
              <p class="card-text flex-grow-1">Create an account to share your own recipes</p>
              <router-link :to="{name: 'Register'}" class="btn btn-success">
                <i class="bi bi-person-plus"></i> Register
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card text-center h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <i class="bi bi-box-arrow-in-right text-info" style="font-size: 3rem;"></i>
              </div>
              <h3 class="card-title">Welcome Back</h3>
              <p class="card-text flex-grow-1">Already have an account? Sign in here</p>
              <router-link :to="{name: 'Auth'}" class="btn btn-info text-white">
                <i class="bi bi-box-arrow-in-right"></i> Login
              </router-link>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Home',
  setup() {
    const store = useStore()
    const isAuthenticated = computed(() => store.getters.isAuthenticated)

    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s, box-shadow 0.3s;
  border: none;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.display-4 {
  color: #0d6efd;
  font-weight: bold;
}
</style>