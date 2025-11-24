<template>
  <div class="auth container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center">Login</h2>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" v-model="credentials.username" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" v-model="credentials.password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Login
              </button>
              <p class="mt-3 text-center">
                Don't have an account? <router-link :to="{name: 'Register'}">Register</router-link>
              </p>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Auth',
  setup() {
    const store = useStore()
    const router = useRouter()

    const credentials = ref({
      username: '',
      password: ''
    })
    const error = ref(null)
    const loading = ref(false)

    const login = async () => {
      error.value = null
      loading.value = true

      try {
        await store.dispatch('login', credentials.value)
        router.push({ name: 'RecipeList' })
      } catch (err) {
        error.value = err.response?.data?.detail || "Invalid credentials"
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      error,
      loading,
      login
    }
  }
}
</script>