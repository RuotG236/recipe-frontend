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
              <div class="mb-3">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" v-model="credentials.password_confirm" required>
              </div>
              <button type="submit" class="btn btn-success w-100" :disabled="!passwordsMatch">Register</button>
              <p v-if="!passwordsMatch && credentials.password_confirm" class="text-danger mt-2 text-center">
                Passwords do not match
              </p>
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
        password: '',
        password_confirm: ''
      },
      error: null,
      success: null
    }
  },
  computed: {
    passwordsMatch() {
      return this.credentials.password === this.credentials.password_confirm
    }
  },
  methods: {
    register() {
      if (!this.passwordsMatch) {
        this.error = "Passwords do not match"
        return
      }

      apiService.registerUser(this.credentials).then(() => {
        this.success = "Registration successful! Redirecting to login..."
        setTimeout(() => {
          this.$router.push({ name: 'Auth' })
        }, 2000)
      }).catch(error => {
        if (error.response?.data) {
          const errors = error.response.data
          const messages = []
          for (const key in errors) {
            if (Array.isArray(errors[key])) {
              messages.push(`${key}: ${errors[key].join(', ')}`)
            } else {
              messages.push(`${key}: ${errors[key]}`)
            }
          }
          this.error = messages.join('\n')
        } else {
          this.error = "Registration failed"
        }
        console.error(error)
      })
    }
  }
}
</script>