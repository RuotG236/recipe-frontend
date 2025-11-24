import { createStore } from 'vuex'
import apiService from '@/http/APIService'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('access'),
    categories: [],
    recipes: [],
    currentRecipe: null,
    favorites: [],
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    isAdmin: state => state.user?.is_staff || false,
    categories: state => state.categories,
    recipes: state => state.recipes,
    currentRecipe: state => state.currentRecipe,
    favorites: state => state.favorites,
    loading: state => state.loading,
    error: state => state.error
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    
    SET_AUTHENTICATED(state, value) {
      state.isAuthenticated = value
    },
    
    SET_CATEGORIES(state, categories) {
      state.categories = categories
    },
    
    SET_RECIPES(state, recipes) {
      state.recipes = recipes
    },
    
    SET_CURRENT_RECIPE(state, recipe) {
      state.currentRecipe = recipe
    },
    
    ADD_RECIPE(state, recipe) {
      state.recipes.unshift(recipe)
    },
    
    UPDATE_RECIPE(state, updatedRecipe) {
      const index = state.recipes.findIndex(r => r.id === updatedRecipe.id)
      if (index !== -1) {
        state.recipes[index] = updatedRecipe
      }
      if (state.currentRecipe?.id === updatedRecipe.id) {
        state.currentRecipe = updatedRecipe
      }
    },
    
    REMOVE_RECIPE(state, recipeId) {
      state.recipes = state.recipes.filter(r => r.id !== recipeId)
    },
    
    SET_FAVORITES(state, favorites) {
      state.favorites = favorites
    },
    
    ADD_FAVORITE(state, recipeId) {
      if (!state.favorites.some(f => f.recipe?.id === recipeId)) {
        state.favorites.push({ recipe: { id: recipeId } })
      }
    },
    
    REMOVE_FAVORITE(state, recipeId) {
      state.favorites = state.favorites.filter(f => f.recipe?.id !== recipeId)
    },
    
    SET_LOADING(state, value) {
      state.loading = value
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    },
    
    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
      state.favorites = []
      localStorage.clear()
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      try {
        const response = await apiService.login(credentials)
        commit('SET_USER', response.data.user)
        commit('SET_AUTHENTICATED', true)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.detail || 'Login failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async register({ commit }, userData) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      try {
        const response = await apiService.register(userData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Registration failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async logout({ commit }) {
      await apiService.logout()
      commit('LOGOUT')
    },
    
    async fetchCategories({ commit }) {
      try {
        const response = await apiService.getCategories()
        commit('SET_CATEGORIES', response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },
    
    async fetchRecipes({ commit }, params = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await apiService.getRecipes(params)
        commit('SET_RECIPES', response.data)
      } catch (error) {
        commit('SET_ERROR', 'Failed to fetch recipes')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchRecipe({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await apiService.getRecipe(id)
        commit('SET_CURRENT_RECIPE', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Failed to fetch recipe')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createRecipe({ commit }, recipeData) {
      commit('SET_LOADING', true)
      try {
        const response = await apiService.createRecipe(recipeData)
        commit('ADD_RECIPE', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Failed to create recipe')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateRecipe({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await apiService.updateRecipe(id, data)
        commit('UPDATE_RECIPE', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Failed to update recipe')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteRecipe({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        await apiService.deleteRecipe(id)
        commit('REMOVE_RECIPE', id)
      } catch (error) {
        commit('SET_ERROR', 'Failed to delete recipe')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchFavorites({ commit }) {
      try {
        const response = await apiService.getFavorites()
        commit('SET_FAVORITES', response.data)
      } catch (error) {
        console.error('Error fetching favorites:', error)
      }
    },
    
    async toggleFavorite({ commit }, recipeId) {
      try {
        const favorites = this.state.favorites
        const isFavorited = favorites.some(f => f.recipe?.id === recipeId)
        
        if (isFavorited) {
          await apiService.removeFavorite(recipeId)
          commit('REMOVE_FAVORITE', recipeId)
        } else {
          await apiService.addFavorite(recipeId)
          commit('ADD_FAVORITE', recipeId)
        }
      } catch (error) {
        commit('SET_ERROR', 'Failed to update favorite')
        throw error
      }
    },
    
    async rateRecipe({ dispatch }, { recipeId, rating }) {
      try {
        await apiService.rateRecipe(recipeId, rating)
        await dispatch('fetchRecipe', recipeId)
      } catch (error) {
        throw error
      }
    },
    
    async addComment({ dispatch }, { recipeId, text }) {
      try {
        await apiService.addComment(recipeId, text)
        await dispatch('fetchRecipe', recipeId)
      } catch (error) {
        throw error
      }
    }
  }
})
