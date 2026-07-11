import { createRouter, createWebHistory } from 'vue-router'
import CompressView from '../views/CompressView.vue'
import BgRemoverView from '../views/BgRemover.vue'
import UpscalerView from '../views/UpscalerView.vue'

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
    {
      path: '/upscaler',
      name: 'upscaler',
      component: UpscalerView
    },

  ]
})

export default router
