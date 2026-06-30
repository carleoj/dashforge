import { createRouter, createWebHistory } from 'vue-router'
import CompressView from '../views/CompressView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/compress'
    },
    {
      path: '/compress',
      name: 'compress',
      component: CompressView
    },
    {
      path: '/bg-remover',
      name: 'bg-remover',
      // Lazy loading this view to keep initial load lightning fast
      component: () => import('../views/BgRemover.vue')
    }
  ]
})

export default router