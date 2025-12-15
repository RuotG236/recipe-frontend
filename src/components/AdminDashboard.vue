<template>
  <div class="container mt-4">
    <h1 class="mb-4"><i class="bi bi-shield-lock"></i> Admin Dashboard</h1>
    
    <div class="row g-4">
      <!-- Manage Users Card -->
      <div class="col-md-4">
        <div class="card h-100 shadow-sm" @click="goToUsers" style="cursor: pointer;">
          <div class="card-body text-center py-5">
            <i class="bi bi-people-fill text-primary" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Manage Users</h4>
            <p class="text-muted">View and manage user accounts</p>
          </div>
        </div>
      </div>

      <!-- Manage Recipes Card -->
      <div class="col-md-4">
        <div class="card h-100 shadow-sm" @click="goToRecipes" style="cursor: pointer;">
          <div class="card-body text-center py-5">
            <i class="bi bi-journal-richtext text-success" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Manage Recipes</h4>
            <p class="text-muted">View, edit, and delete recipes</p>
          </div>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="col-md-4">
        <div class="card h-100 shadow-sm" @click="goToSettings" style="cursor: pointer;">
          <div class="card-body text-center py-5">
            <i class="bi bi-gear-fill text-secondary" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Settings</h4>
            <p class="text-muted">Configure app settings</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mt-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h2>{{ stats.users }}</h2>
            <p class="mb-0">Total Users</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h2>{{ stats.recipes }}</h2>
            <p class="mb-0">Total Recipes</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body text-center">
            <h2>{{ stats.categories }}</h2>
            <p class="mb-0">Categories</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h2>{{ stats.comments }}</h2>
            <p class="mb-0">Comments</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    
    const stats = ref({
      users: 0,
      recipes: 0,
      categories: 0,
      comments: 0
    })

    const goToUsers = () => {
      router.push({ name: 'AdminUsers' })
    }

    const goToRecipes = () => {
      router.push({ name: 'AdminRecipes' })
    }

    const goToSettings = () => {
      alert('Settings page coming soon!')
    }

    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersRes = await apiService.getUsers()
        const users = usersRes.data.results || usersRes.data || []
        stats.value.users = users.length

        // Fetch recipes count
        const recipesRes = await apiService.getAdminRecipes()
        const recipes = recipesRes.data.results || recipesRes.data || []
        stats.value.recipes = recipes.length

        // Count comments from recipes
        let totalComments = 0
        recipes.forEach(r => {
          totalComments += r.comments?.length || 0
        })
        stats.value.comments = totalComments

        // Fetch categories count
        const catsRes = await apiService.getCategories()
        const cats = catsRes.data.results || catsRes.data || []
        stats.value.categories = cats.length
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    onMounted(fetchStats)

    return {
      stats,
      goToUsers,
      goToRecipes,
      goToSettings
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}
</style>
