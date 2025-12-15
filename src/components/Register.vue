<template>
  <div class="register container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">
              <i class="bi bi-person-plus"></i> Create Account
            </h2>
            
            <form @submit.prevent="register" novalidate>
              <!-- Username -->
              <div class="mb-3">
                <label class="form-label">Username <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.username, 'is-valid': touched.username && !errors.username && credentials.username }"
                  v-model="credentials.username"
                  @blur="validateField('username')"
                  @input="touched.username = true"
                  placeholder="Choose a username"
                  required
                >
                <div v-if="errors.username" class="invalid-feedback">{{ errors.username }}</div>
                <small v-else class="text-muted">3-30 characters, letters, numbers, and underscores only</small>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.email, 'is-valid': touched.email && !errors.email && credentials.email }"
                  v-model="credentials.email"
                  @blur="validateField('email')"
                  @input="touched.email = true"
                  placeholder="your@email.com"
                  required
                >
                <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label class="form-label">Password <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.password, 'is-valid': touched.password && !errors.password && credentials.password }"
                    v-model="credentials.password"
                    @blur="validateField('password')"
                    @input="touched.password = true; validateField('password')"
                    placeholder="Create a strong password"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
                
                <!-- Password Strength Indicator -->
                <div v-if="credentials.password" class="mt-2">
                  <div class="progress" style="height: 5px;">
                    <div 
                      class="progress-bar" 
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <small :class="passwordStrengthTextClass">{{ passwordStrengthText }}</small>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="mb-4">
                <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.password_confirm, 'is-valid': touched.password_confirm && !errors.password_confirm && credentials.password_confirm }"
                  v-model="credentials.password_confirm"
                  @blur="validateField('password_confirm')"
                  @input="touched.password_confirm = true"
                  placeholder="Confirm your password"
                  required
                >
                <div v-if="errors.password_confirm" class="invalid-feedback">{{ errors.password_confirm }}</div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn btn-success w-100" 
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Creating Account...' : 'Create Account' }}
              </button>

              <p class="mt-3 text-center">
                Already have an account? 
                <router-link :to="{name: 'Auth'}" class="text-decoration-none">Login here</router-link>
              </p>
            </form>

            <!-- Success/Error Messages -->
            <div v-if="success" class="alert alert-success mt-3">
              <i class="bi bi-check-circle"></i> {{ success }}
            </div>
            <div v-if="error" class="alert alert-danger mt-3">
              <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/http/APIService'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    
    const credentials = reactive({
      username: '',
      email: '',
      password: '',
      password_confirm: ''
    })

    const errors = reactive({
      username: null,
      email: null,
      password: null,
      password_confirm: null
    })

    const touched = reactive({
      username: false,
      email: false,
      password: false,
      password_confirm: false
    })

    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)
    const showPassword = ref(false)

    const validateUsername = (value) => {
      if (!value || value.length < 3) {
        return 'Username must be at least 3 characters'
      }
      if (value.length > 30) {
        return 'Username cannot exceed 30 characters'
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Username can only contain letters, numbers, and underscores'
      }
      return null
    }

    const validateEmail = (value) => {
      if (!value) {
        return 'Email is required'
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
      return null
    }

    const validatePassword = (value) => {
      if (!value) {
        return 'Password is required'
      }
      if (value.length < 6) {
        return 'Password must be at least 6 characters'
      }
      return null
    }

    const validatePasswordConfirm = (value) => {
      if (!value) {
        return 'Please confirm your password'
      }
      if (value !== credentials.password) {
        return 'Passwords do not match'
      }
      return null
    }

    const validateField = (field) => {
      switch (field) {
        case 'username':
          errors.username = validateUsername(credentials.username)
          break
        case 'email':
          errors.email = validateEmail(credentials.email)
          break
        case 'password':
          errors.password = validatePassword(credentials.password)
          if (touched.password_confirm) {
            errors.password_confirm = validatePasswordConfirm(credentials.password_confirm)
          }
          break
        case 'password_confirm':
          errors.password_confirm = validatePasswordConfirm(credentials.password_confirm)
          break
      }
    }

    const validateAll = () => {
      errors.username = validateUsername(credentials.username)
      errors.email = validateEmail(credentials.email)
      errors.password = validatePassword(credentials.password)
      errors.password_confirm = validatePasswordConfirm(credentials.password_confirm)
      
      return !errors.username && !errors.email && !errors.password && !errors.password_confirm
    }

    const passwordStrength = computed(() => {
      const password = credentials.password
      if (!password) return 0
      
      let strength = 0
      if (password.length >= 6) strength += 20
      if (password.length >= 8) strength += 20
      if (/[A-Z]/.test(password)) strength += 20
      if (/[0-9]/.test(password)) strength += 20
      if (/[^A-Za-z0-9]/.test(password)) strength += 20
      
      return strength
    })

    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value < 40) return 'bg-danger'
      if (passwordStrength.value < 60) return 'bg-warning'
      if (passwordStrength.value < 80) return 'bg-info'
      return 'bg-success'
    })

    const passwordStrengthText = computed(() => {
      if (passwordStrength.value < 40) return 'Weak password'
      if (passwordStrength.value < 60) return 'Fair password'
      if (passwordStrength.value < 80) return 'Good password'
      return 'Strong password'
    })

    const passwordStrengthTextClass = computed(() => {
      if (passwordStrength.value < 40) return 'text-danger'
      if (passwordStrength.value < 60) return 'text-warning'
      if (passwordStrength.value < 80) return 'text-info'
      return 'text-success'
    })

    const isFormValid = computed(() => {
      return credentials.username && 
             credentials.email && 
             credentials.password && 
             credentials.password_confirm &&
             !errors.username &&
             !errors.email &&
             !errors.password &&
             !errors.password_confirm
    })

    const register = async () => {
      error.value = null
      success.value = null
      
      Object.keys(touched).forEach(key => touched[key] = true)
      
      if (!validateAll()) {
        error.value = 'Please fix the errors above'
        return
      }

      loading.value = true

      try {
        await apiService.register(credentials)
        success.value = 'Registration successful! Redirecting to login...'
        
        setTimeout(() => {
          router.push({ name: 'Auth' })
        }, 2000)
      } catch (err) {
        console.error('Registration error:', err)
        
        if (err.response?.data) {
          const backendErrors = err.response.data
          
          if (backendErrors.username) {
            errors.username = Array.isArray(backendErrors.username) 
              ? backendErrors.username.join(', ') 
              : backendErrors.username
          }
          if (backendErrors.email) {
            errors.email = Array.isArray(backendErrors.email) 
              ? backendErrors.email.join(', ') 
              : backendErrors.email
          }
          if (backendErrors.password) {
            errors.password = Array.isArray(backendErrors.password) 
              ? backendErrors.password.join(', ') 
              : backendErrors.password
          }
          if (backendErrors.non_field_errors) {
            error.value = Array.isArray(backendErrors.non_field_errors) 
              ? backendErrors.non_field_errors.join(', ') 
              : backendErrors.non_field_errors
          } else if (!errors.username && !errors.email && !errors.password) {
            error.value = 'Registration failed. Please try again.'
          }
        } else {
          error.value = 'Registration failed. Please check your connection and try again.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      errors,
      touched,
      loading,
      error,
      success,
      showPassword,
      passwordStrength,
      passwordStrengthClass,
      passwordStrengthText,
      passwordStrengthTextClass,
      isFormValid,
      validateField,
      register
    }
  }
}
</script>

<style scoped>
.card {
  margin-top: 2rem;
}

.is-valid {
  border-color: #198754;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}

.progress {
  border-radius: 0;
}
</style>
