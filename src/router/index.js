import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Import views
import Home from '@/components/Home.vue'
import Auth from '@/components/Auth.vue'
import Register from '@/components/Register.vue'
import RecipeList from '@/components/RecipeList.vue'
import RecipeDetail from '@/components/RecipeDetail.vue'
import RecipeCreate from '@/components/RecipeCreate.vue'
import RecipeEdit from '@/components/RecipeEdit.vue'
import MyRecipes from '@/components/MyRecipes.vue'
import Favorites from '@/components/Favorites.vue'
import Profile from '@/components/Profile.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import AdminUsers from '@/components/AdminUsers.vue'
import AdminRecipes from '@/components/AdminRecipes.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/recipes',
    name: 'RecipeList',
    component: RecipeList
  },
  {
    path: '/recipes/new',
    name: 'RecipeCreate',
    component: RecipeCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: RecipeDetail
  },
  {
    path: '/recipes/:id/edit',
    name: 'RecipeEdit',
    component: RecipeEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: MyRecipes,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/recipes',
    name: 'AdminRecipes',
    component: AdminRecipes,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const isAdmin = store.getters.isAdmin
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Auth', query: { redirect: to.fullPath } })
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!isAdmin) {
        next({ name: 'Home' })
      } else {
        next()
      }
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
