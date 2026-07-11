import { createRouter, createWebHistory } from 'vue-router'
import CompressView from '../views/CompressView.vue'
import BgRemoverView from '../views/BgRemover.vue'

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
      component: BgRemoverView
    },

  ]
})

export default router
