import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Auth from '@/components/Auth.vue'
import Register from '@/components/Register.vue'
import RecipeList from '@/components/RecipeList.vue'
import RecipeCreate from '@/components/RecipeCreate.vue'
import RecipeDetail from '@/components/RecipeDetail.vue'
import MyRecipes from '@/components/MyRecipes.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/recipes', name: 'RecipeList', component: RecipeList },
  { path: '/recipes/new', name: 'RecipeCreate', component: RecipeCreate },
  { path: '/recipes/:id', name: 'RecipeDetail', component: RecipeDetail },
  { path: '/my-recipes', name: 'MyRecipes', component: MyRecipes },
  { path: '/auth', name: 'Auth', component: Auth },
  { path: '/register', name: 'Register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router