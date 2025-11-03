import axios from 'axios'

// Point this to your backend
const API_URL = 'http://127.0.0.1:8000/api'

export class APIService {
  getRecipes() {
    return axios.get(`${API_URL}/recipes/`)
  }
  addRecipe(recipe, token) {
    return axios.post(`${API_URL}/recipes/`, recipe, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  registerUser(credentials) {
    return axios.post(`${API_URL}/auth/register/`, credentials)
  }
  authenticateLogin(credentials) {
    return axios.post(`${API_URL}/auth/login/`, credentials)
  }
}
