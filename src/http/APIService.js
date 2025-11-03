import axios from 'axios'

const API_URL = 'https://ruotg123.pythonanywhere.com/api'

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