import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'https://ruotg123.pythonanywhere.com/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken
          })
          localStorage.setItem('access', response.data.access)
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear()
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

// API Service class
export class APIService {
  // ============================================
  // Authentication
  // ============================================
  register(userData) {
    return apiClient.post('/auth/register/', userData)
  }

  async login(credentials) {
    const response = await apiClient.post('/auth/login/', credentials)
    if (response.data.access) {
      localStorage.setItem('access', response.data.access)
      localStorage.setItem('refresh', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('username', response.data.user.username)
      localStorage.setItem('isAuthenticated', 'true')
    }
    return response
  }

  async logout() {
    const refresh = localStorage.getItem('refresh')
    try {
      await apiClient.post('/auth/logout/', { refresh })
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.clear()
  }

  getProfile() {
    return apiClient.get('/auth/profile/')
  }

  updateProfile(data) {
    return apiClient.patch('/auth/profile/', data)
  }

  // ============================================
  // Recipes
  // ============================================
  getRecipes(params = {}) {
    return apiClient.get('/recipes/', { params })
  }

  getRecipe(id) {
    return apiClient.get(`/recipes/${id}/`)
  }

  createRecipe(data) {
    return apiClient.post('/recipes/', data)
  }

  updateRecipe(id, data) {
    return apiClient.patch(`/recipes/${id}/`, data)
  }

  deleteRecipe(id) {
    return apiClient.delete(`/recipes/${id}/`)
  }

  getMyRecipes() {
    return apiClient.get('/recipes/my_recipes/')
  }

  // ============================================
  // Categories
  // ============================================
  getCategories() {
    return apiClient.get('/categories/')
  }

  createCategory(data) {
    return apiClient.post('/categories/', data)
  }

  // ============================================
  // Favorites
  // ============================================
  getFavorites() {
    return apiClient.get('/favorites/')
  }

  addFavorite(recipeId) {
    return apiClient.post(`/recipes/${recipeId}/favorite/`)
  }

  removeFavorite(recipeId) {
    return apiClient.delete(`/recipes/${recipeId}/unfavorite/`)
  }

  // ============================================
  // Ratings - UPDATED WITH COMMENT SUPPORT
  // ============================================
  rateRecipe(recipeId, rating, comment = '') {
    return apiClient.post(`/recipes/${recipeId}/rate/`, { 
      rating,
      comment 
    })
  }

  // ============================================
  // Comments
  // ============================================
  addComment(recipeId, text) {
    return apiClient.post(`/recipes/${recipeId}/comment/`, { text })
  }

  updateComment(commentId, text) {
    return apiClient.patch(`/comments/${commentId}/`, { text })
  }

  deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}/`)
  }

  // ============================================
  // Admin
  // ============================================
  getUsers() {
    return apiClient.get('/admin/users/')
  }

  updateUser(userId, data) {
    return apiClient.patch(`/admin/users/${userId}/`, data)
  }

  getAdminRecipes() {
    return apiClient.get('/admin/recipes/')
  }

  updateAdminRecipe(recipeId, data) {
    return apiClient.patch(`/admin/recipes/${recipeId}/`, data)
  }

  deleteAdminRecipe(recipeId) {
    return apiClient.delete(`/admin/recipes/${recipeId}/`)
  }

  // ============================================
  // Legacy method
  // ============================================
  addRecipe(recipe) {
    return this.createRecipe(recipe)
  }

  registerUser(credentials) {
    return this.register(credentials)
  }

  authenticateLogin(credentials) {
    return this.login(credentials)
  }
}

// Create singleton instance
const apiService = new APIService()

// Export both the class and a default instance
export default apiService
