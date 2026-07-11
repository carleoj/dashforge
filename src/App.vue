<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import NavDropdown from './components/NavDropdown.vue'
import { toolCategories } from './config/tools.js'

const route = useRoute()
const isDrawerOpen = ref(false)
const expandedMobileCategory = ref('image')
const openDesktopCategory = ref(null)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
  openDesktopCategory.value = null
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const toggleDesktopCategory = (categoryId) => {
  openDesktopCategory.value = openDesktopCategory.value === categoryId ? null : categoryId
}

const closeDesktopCategory = () => {
  openDesktopCategory.value = null
}

const toggleMobileCategory = (categoryId) => {
  expandedMobileCategory.value = expandedMobileCategory.value === categoryId ? null : categoryId
}
</script>

<template>
  <div class="min-h-screen app-shell flex flex-col font-sans text-slate-100">
    <header
      class="sticky top-0 z-40 border-b border-cyan-300/10 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-slate-950/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-3 text-xl font-bold text-white shrink-0">
          <img src="/letter-d.png" alt="Logo" class="h-9 w-9 rounded-xl object-cover shadow-lg shadow-cyan-950/30" />
          <span>DashForge</span>
        </router-link>

        <nav class="hidden md:flex items-center gap-1 ml-auto">
          <NavDropdown v-for="category in toolCategories" :key="category.id" :category="category"
            :open-category-id="openDesktopCategory" @toggle="toggleDesktopCategory" @close="closeDesktopCategory" />
        </nav>

        <button @click="toggleDrawer"
          class="md:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300 focus:outline-none cursor-pointer ml-auto"
          aria-label="Toggle Menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="isDrawerOpen" @click="closeDrawer"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden" />

    <aside
      class="fixed top-0 right-0 bottom-0 w-72 bg-slate-950 z-50 p-6 shadow-2xl shadow-cyan-950/40 md:hidden flex flex-col gap-2 overflow-y-auto transition-transform duration-300 ease-in-out border-l border-cyan-300/10"
      :class="isDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-slate-100">Tools</span>
        <button @click="closeDrawer" class="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-for="category in toolCategories" :key="category.id"
        class="border border-cyan-300/10 rounded-xl overflow-hidden bg-white/[0.03]">
        <button type="button" @click="toggleMobileCategory(category.id)"
          class="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-slate-200 bg-white/[0.04] cursor-pointer">
          {{ category.label }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-4 h-4 transition-transform" :class="expandedMobileCategory === category.id ? 'rotate-180' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div v-if="expandedMobileCategory === category.id" class="py-1">
          <template v-for="tool in category.tools" :key="tool.label">
            <router-link v-if="tool.path" :to="tool.path" @click="closeDrawer"
              class="block px-4 py-2.5 text-sm transition-colors" :class="route.name === tool.routeName
                ? 'bg-cyan-400/10 text-cyan-200 font-medium'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'">
              {{ tool.label }}
            </router-link>
            <span v-else class="flex items-center justify-between px-4 py-2.5 text-sm text-slate-500">
              {{ tool.label }}
              <span
                class="text-[10px] uppercase tracking-wide font-semibold bg-fuchsia-400/10 text-fuchsia-200 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </span>
          </template>
        </div>
      </div>
    </aside>

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <router-view />
    </main>
  </div>
</template>
