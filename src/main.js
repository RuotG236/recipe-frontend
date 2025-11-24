import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

// Bootstrap Icons - Required for bi-* icon classes
import "bootstrap-icons/font/bootstrap-icons.css"

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTrash, faPencil, faPlus, faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

library.add(faTrash, faPencil, faPlus, faStar)

const app = createApp(App)

// Register Vuex store
app.use(store)

// Register router
app.use(router)

// Register FontAwesome globally
app.component("font-awesome-icon", FontAwesomeIcon)

// Mount app
app.mount('#app')