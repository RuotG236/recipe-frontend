import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import { library } from "@fortawesome/fontawesome-svg-core"
import { faTrash, faPencil, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

library.add(faTrash, faPencil, faPlus)

const app = createApp(App)

// Register Vuex store
app.use(store)

// Register router
app.use(router)

// Register FontAwesome globally
app.component("font-awesome-icon", FontAwesomeIcon)

// Mount app
app.mount('#app')

// If you want axios globally, attach it to app.config.globalProperties
app.config.globalProperties.$axios = axios
