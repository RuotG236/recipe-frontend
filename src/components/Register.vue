<template>
  <div class="register container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center">Register</h2>
            <form @submit.prevent="register">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" v-model="credentials.username" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="credentials.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" v-model="credentials.password" required>
              </div>
              <button type="submit" class="btn btn-success w-100">Register</button>
              <p class="mt-3 text-center">
                Already have an account? <router-link :to="{name: 'Auth'}">Login</router-link>
              </p>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
            <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
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
  name: 'Register',
  data() {
    return {
      credentials: {
        username: '',
        email: '',
        password: ''
      },
      error: null,
      success: null
    }
  },
  methods: {
    register() {
      apiService.registerUser(this.credentials).then(() => {
        this.success = "Registration successful! Redirecting to login..."
        setTimeout(() => {
          this.$router.push({ name: 'Auth' })
        }, 2000)
      }).catch(error => {
        this.error = "Registration failed"
        console.error(error)
      })
    }
  }
}
</script>