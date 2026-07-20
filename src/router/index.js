import { createRouter, createWebHistory } from 'vue-router'
import CompressView from '../views/CompressView.vue'
import BgRemoverView from '../views/BgRemover.vue'
import UpscalerView from '../views/UpscalerView.vue'
import WordCounterView from '../views/WordCounterView.vue'
import CaseConverterView from '../views/CaseConverterView.vue'
import TextCleanerView from '../views/TextCleanerView.vue'
import TextExtractorView from '../views/TextExtractor.vue'
import PDFCompressorView from '../views/PDFCompressor.vue'

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
    {
      path: '/word-counter',
      name: 'word-counter',
      component: WordCounterView
    },
    {
      path: '/case-converter',
      name: 'case-converter',
      component: CaseConverterView
    },
    {
      path: '/text-cleaner',
      name: 'text-cleaner',
      component: TextCleanerView
    },
    {
      path: '/text-extractor',
      name: 'text-extractor',
      component: TextExtractorView
    },
    {
      path: '/pdf-compressor',
      name: 'pdf-compressor',
      component: PDFCompressorView
    }
  ]
})

export default router
