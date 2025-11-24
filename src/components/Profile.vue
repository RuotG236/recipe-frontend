<template>
  <div class="profile container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">My Profile</h2>

            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" v-model="profile.username" disabled>
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="profile.email" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Member Since</label>
                <input type="text" class="form-control" :value="formatDate(profile.date_joined)" disabled>
              </div>

              <div class="mb-3">
                <label class="form-label">Account Type</label>
                <input type="text" class="form-control"
                       :value="profile.is_staff ? 'Administrator' : 'Regular User'" disabled>
              </div>

              <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-secondary" @click="resetForm">Reset</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Update Profile
                </button>
              </div>
            </form>

            <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

            <hr class="my-4">

            <h4>Account Statistics</h4>
            <div class="row mt-3">
              <div class="col-md-4 text-center">
                <div class="bg-light p-3 rounded">
                  <h3 class="text-primary">{{ stats.recipes }}</h3>
                  <p class="mb-0">Recipes Created</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="bg-light p-3 rounded">
                  <h3 class="text-danger">{{ stats.favorites }}</h3>
                  <p class="mb-0">Favorites</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="bg-light p-3 rounded">
                  <h3 class="text-warning">{{ stats.ratings }}</h3>
                  <p class="mb-0">Ratings Given</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import apiService from '@/http/APIService'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()

    const profile = ref({
      username: '',
      email: '',
      is_staff: false,
      date_joined: ''
    })

    const stats = ref({
      recipes: 0,
      favorites: 0,
      ratings: 0
    })

    const loading = ref(false)
    const success = ref('')
    const error = ref('')

    const fetchProfile = async () => {
      try {
        const response = await apiService.getProfile()
        profile.value = response.data

        // Fetch statistics
        const [recipesRes, favoritesRes] = await Promise.all([
          apiService.getMyRecipes(),
          apiService.getFavorites()
        ])

        stats.value.recipes = recipesRes.data.length
        stats.value.favorites = favoritesRes.data.length
      } catch (err) {
        console.error('Error fetching profile:', err)
        error.value = 'Failed to load profile'
      }
    }

    const updateProfile = async () => {
      loading.value = true
      success.value = ''
      error.value = ''

      try {
        const response = await apiService.updateProfile({
          email: profile.value.email
        })
        profile.value = response.data

        // Update user in localStorage and store
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.email = response.data.email
        localStorage.setItem('user', JSON.stringify(user))
        store.commit('SET_USER', user)

        success.value = 'Profile updated successfully!'
      } catch (err) {
        error.value = err.response?.data?.email?.[0] || 'Failed to update profile'
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      fetchProfile()
      success.value = ''
      error.value = ''
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(fetchProfile)

    return {
      profile,
      stats,
      loading,
      success,
      error,
      updateProfile,
      resetForm,
      formatDate
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
</style>