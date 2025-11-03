<template>
  <ul class="nav justify-content-end">
    <div class="FS">Recipe App</div>
    <li class="nav-item"><router-link to="/">Home</router-link> | </li>
    <li class="nav-item"><router-link :to="{name: 'RecipeList'}">Recipes</router-link> | </li>
    <li class="nav-item" v-if="!authenticated"><router-link :to="{name: 'Register'}">Register</router-link> | </li>
    <li class="nav-item" v-if="!authenticated"><router-link :to="{name: 'Auth'}">Log in</router-link></li>
    <li class="nav-item" v-if="authenticated" @click="logout"><router-link :to="{name: 'Auth'}">Logout</router-link></li>
  </ul>
  <router-view/>
</template>

<script>
import router from './router'
export default {
  data: () => ({ authenticated: false }),
  mounted() {
    this.authenticated = JSON.parse(localStorage.getItem("isAuthenticated") || "false")
  },
  methods: {
    logout() {
      localStorage.clear()
      localStorage.setItem("isAuthenticated", false)
      this.authenticated = false
      router.push("/auth")
    }
  }
}
</script>
