<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand fs-3 fw-bold" to="/">
          <i class="bi bi-book"></i> Recipe Book
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'RecipeList'}">
                <i class="bi bi-grid-3x3-gap"></i> Browse
              </router-link>
            </li>
            
            <template v-if="isAuthenticated">
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'MyRecipes'}">
                  <i class="bi bi-journal-text"></i> My Recipes
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'Favorites'}">
                  <i class="bi bi-heart"></i> Favorites
                </router-link>
              </li>
              
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-circle"></i> {{ currentUser?.username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <router-link class="dropdown-item" :to="{name: 'Profile'}">
                      <i class="bi bi-person"></i> Profile
                    </router-link>
                  </li>
                  <li v-if="isAdmin">
                    <router-link class="dropdown-item" :to="{name: 'AdminDashboard'}">
                      <i class="bi bi-speedometer2"></i> Admin Panel
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="logout">
                      <i class="bi bi-box-arrow-right"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
            </template>
            
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'Register'}">Register</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'Auth'}">Login</router-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
    
    <main class="min-vh-100 bg-light">
      <router-view />
    </main>
    
    <footer class="bg-dark text-white text-center py-3 mt-5">
      <p class="mb-0">&copy; 2024 Recipe Book. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const currentUser = computed(() => store.getters.currentUser)
    const isAdmin = computed(() => store.getters.isAdmin)
    
    const logout = async () => {
      await store.dispatch('logout')
      router.push({ name: 'Auth' })
    }
    
    return {
      isAuthenticated,
      currentUser,
      isAdmin,
      logout
    }
  }
}
</script>

<style>
.navbar-brand {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.nav-link {
  transition: all 0.3s ease;
}

.nav-link:hover {
  transform: translateY(-2px);
}

main {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
