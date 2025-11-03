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
              <button type="submit" class="btn btn-primary w-100">Login</button>
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
import { APIService } from '../http/APIService'

const apiService = new APIService()

export default {
  name: 'Auth',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      error: null
    }
  },
  methods: {
    login() {
      apiService.authenticateLogin(this.credentials).then(response => {
        localStorage.setItem("access", response.data.access)
        localStorage.setItem("refresh", response.data.refresh)
        localStorage.setItem("isAuthenticated", true)
        this.$router.push({ name: 'RecipeList' })
      }).catch(error => {
        this.error = "Invalid credentials"
        console.error(error)
      })
    }
  }
}
</script>