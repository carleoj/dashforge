import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js' // Import the router you just made
import './assets/main.css'

const app = createApp(App)

app.use(router) // Tell Vue to use the router

app.mount('#app')