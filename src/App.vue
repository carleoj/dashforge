<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavDropdown from './components/NavDropdown.vue'
import { toolCategories } from './config/tools.js'
import { useTheme } from './composables/useTheme.js'
import { useLikedTools } from './composables/useLikedTools.js'
import './assets/theme.css'
  
const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isLiked } = useLikedTools()
const isDrawerOpen = ref(false)
const expandedMobileCategory = ref('image')
const openDesktopCategory = ref(null)

// Sort tools within each category to show liked tools first
const sortedToolCategories = computed(() => {
  return toolCategories.map(category => ({
    ...category,
    tools: [...category.tools].sort((a, b) => {
      const aLiked = a.id && isLiked(a.id)
      const bLiked = b.id && isLiked(b.id)
      if (aLiked && !bLiked) return -1
      if (!aLiked && bLiked) return 1
      return 0
    })
  }))
})

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
  <div class="min-h-screen app-shell flex flex-col font-sans transition-colors duration-300"
    :class="[
      isDark ? 'text-slate-100' : 'text-slate-800',
      isDark ? 'bg-[#1a1b26]' : 'bg-[var(--bg-primary)]'
    ]"
    :style="{ backgroundColor: isDark ? '#1a1b26' : 'var(--bg-primary)' }">
    <header
      class="sticky top-0 z-40 border-b backdrop-blur-xl shadow-lg transition-colors duration-300"
      :class="isDark ? 'border-cyan-300/10 bg-slate-950/85 shadow-slate-950/30' : 'border-accent-primary/15 bg-[var(--backdrop-bg)] shadow-[var(--shadow-color)]'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-3 text-xl font-bold shrink-0 transition-colors"
          :class="isDark ? 'text-white' : 'text-[var(--text-primary)]'">
          <img src="/letter-d.png" alt="Logo" class="h-9 w-9 rounded-xl object-cover shadow-lg transition-shadow" :class="isDark ? 'shadow-cyan-950/30' : 'shadow-black/20'" />
          <span>DashForge</span>
        </router-link>

        <nav class="hidden md:flex items-center gap-1">
          <NavDropdown v-for="category in sortedToolCategories" :key="category.id" :category="category"
            :open-category-id="openDesktopCategory" @toggle="toggleDesktopCategory" @close="closeDesktopCategory" />
        </nav>

        <button @click="toggleTheme"
          class="p-2 rounded-lg focus:outline-none cursor-pointer transition-colors"
          :class="isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/10 text-[var(--text-secondary)]'"
          aria-label="Toggle Theme">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        </button>

        <button @click="toggleDrawer"
          class="md:hidden p-2 rounded-lg focus:outline-none cursor-pointer ml-auto transition-colors"
          :class="isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/10 text-slate-600'"
          aria-label="Toggle Menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="isDrawerOpen" @click="closeDrawer"
      class="fixed inset-0 backdrop-blur-sm z-40 md:hidden transition-colors"
      :class="isDark ? 'bg-slate-950/70' : 'bg-black/30'" />

    <aside
      class="fixed top-0 right-0 bottom-0 w-72 z-50 p-6 shadow-2xl md:hidden flex flex-col gap-2 overflow-y-auto transition-transform duration-300 ease-in-out border-l transition-colors"
      :class="[
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        isDark ? 'bg-slate-950 shadow-cyan-950/40 border-cyan-300/10' : 'bg-[var(--bg-secondary)] shadow-black/20 border-accent-primary/15'
      ]">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold transition-colors" :class="isDark ? 'text-slate-100' : 'text-[var(--text-primary)]'">Tools</span>
        <button @click="closeDrawer" class="p-2 rounded-lg cursor-pointer transition-colors" :class="isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/10 text-slate-600'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-for="category in sortedToolCategories" :key="category.id"
        class="border rounded-xl overflow-hidden transition-colors"
        :class="isDark ? 'border-cyan-300/10 bg-white/[0.03]' : 'border-accent-primary/15 bg-[var(--card-bg)]'">
        <button type="button" @click="toggleMobileCategory(category.id)"
          class="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold cursor-pointer transition-colors"
          :class="isDark ? 'text-slate-200 bg-white/[0.04]' : 'text-[var(--text-primary)] bg-[var(--card-hover)]'">
          {{ category.label }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-4 h-4 transition-transform" :class="expandedMobileCategory === category.id ? 'rotate-180' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div v-if="expandedMobileCategory === category.id" class="py-1">
          <template v-for="tool in category.tools" :key="tool.label">
            <router-link v-if="tool.path" :to="tool.path" @click="closeDrawer"
              class="flex items-center justify-between px-4 py-2.5 text-sm transition-colors" :class="route.name === tool.routeName
                ? (isDark ? 'bg-cyan-400/10 text-cyan-200' : 'bg-accent-primary/10 text-accent-primary') + ' font-medium'
                : (isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]')">
              <span class="flex items-center gap-2">
                {{ tool.label }}
                <svg
                  v-if="isLiked(tool.id)"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4 transition-colors"
                  :class="isDark ? 'text-pink-400' : 'text-pink-500'"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </span>
            </router-link>
            <span v-else class="flex items-center justify-between px-4 py-2.5 text-sm transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-muted)]'">
              {{ tool.label }}
              <span
                class="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded transition-colors"
                :class="isDark ? 'bg-fuchsia-400/10 text-fuchsia-200' : 'bg-[var(--coming-soon-bg)] text-[var(--coming-soon-text)]'">
                Soon
              </span>
            </span>
          </template>
        </div>
      </div>
    </aside>

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-300"
      :class="isDark ? '' : 'bg-[var(--bg-primary)]'">
      <router-view />
    </main>

    <!-- Donation Card -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300"
      :class="isDark ? '' : 'bg-[var(--bg-primary)]'">
      <div class="border rounded-xl overflow-hidden backdrop-blur-xl transition-colors"
        :class="isDark ? 'border-cyan-300/10 bg-white/[0.03]' : 'border-accent-primary/15 bg-[var(--card-bg)]'">
        <div class="p-6 sm:p-8">
          <div class="flex items-start justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 transition-colors" :class="isDark ? 'text-cyan-400' : 'text-[var(--accent-primary)]'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <h3 class="text-lg font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[var(--text-primary)]'">Support DashForge</h3>
              </div>
              <p class="text-sm mb-4 transition-colors" :class="isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'">
                Enjoy using DashForge? Consider buying me a coffee to support continued development and keep these tools free for everyone.
              </p>
              <div class="rounded-lg p-4 border transition-colors" :class="isDark ? 'bg-slate-950/50 border-cyan-300/10' : 'bg-black/5 border-accent-primary/15'">
                <p class="text-xs uppercase tracking-wide font-semibold mb-2 transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-muted)]'">Account Details</p>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="transition-colors" :class="isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'">GCash (C*** J***** P**o):</span>
                    <span class="font-mono transition-colors" :class="isDark ? 'text-cyan-200' : 'text-[var(--accent-primary)]'">0929-727-4876</span>
                  </div>
                  <!-- <div class="flex items-center gap-2">
                    <span class="transition-colors" :class="isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'">PayPal:</span>
                    <span class="font-mono transition-colors" :class="isDark ? 'text-cyan-200' : 'text-[var(--accent-primary)]'">dashforge@example.com</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="transition-colors" :class="isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'">BPI:</span>
                    <span class="font-mono transition-colors" :class="isDark ? 'text-cyan-200' : 'text-[var(--accent-primary)]'">1234-5678-9012</span>
                  </div> -->
                </div>
              </div>
            </div>
            <div class="hidden sm:block">
              <img src="/letter-d.png" alt="DashForge" class="h-16 w-16 rounded-xl object-cover shadow-lg transition-shadow" :class="isDark ? 'shadow-cyan-950/30' : 'shadow-black/20'" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t backdrop-blur-xl transition-colors duration-300"
      :class="isDark ? 'border-cyan-300/10 bg-slate-950/85' : 'border-accent-primary/15 bg-[var(--bg-secondary)]'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="space-y-4">
            <router-link to="/" class="flex items-center gap-3 text-xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[var(--text-primary)]'">
              <img src="/letter-d.png" alt="Logo" class="h-8 w-8 rounded-xl object-cover shadow-lg transition-shadow" :class="isDark ? 'shadow-cyan-950/30' : 'shadow-black/20'" />
              <span>DashForge</span>
            </router-link>
            <p class="text-sm transition-colors" :class="isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'">
              Your all-in-one toolkit for image processing, file management, and text utilities. Fast, free, and privacy-focused.
            </p>
          </div>

          <!-- Tools by Category -->
          <div v-for="category in toolCategories" :key="category.id" class="space-y-4">
            <h4 class="font-semibold transition-colors" :class="isDark ? 'text-white' : 'text-[var(--text-primary)]'">{{ category.label }}</h4>
            <ul class="space-y-2">
              <li v-for="tool in category.tools" :key="tool.label">
                <router-link v-if="tool.path" :to="tool.path" class="text-sm transition-colors" :class="isDark ? 'text-slate-400 hover:text-cyan-300' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'">
                  {{ tool.label }}
                </router-link>
                <span v-else class="text-sm flex items-center gap-2 transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-muted)]'">
                  {{ tool.label }}
                  <span class="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded transition-colors" :class="isDark ? 'bg-fuchsia-400/10 text-fuchsia-200' : 'bg-[var(--coming-soon-bg)] text-[var(--coming-soon-text)]'">
                    Soon
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <!-- Social Links -->
          <div class="space-y-4">
            <h4 class="font-semibold transition-colors" :class="isDark ? 'text-white' : 'text-[var(--text-primary)]'">Connect</h4>
            <div class="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg transition-colors" :class="isDark ? 'bg-white/[0.04] hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-300' : 'bg-[var(--card-bg)] hover:bg-accent-primary/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg transition-colors" :class="isDark ? 'bg-white/[0.04] hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-300' : 'bg-[var(--card-bg)] hover:bg-accent-primary/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg transition-colors" :class="isDark ? 'bg-white/[0.04] hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-300' : 'bg-[var(--card-bg)] hover:bg-accent-primary/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M12.51 8.796v1.697a3.742 3.742 0 0 1 3.428-1.874c3.568 0 4.288 2.306 4.288 5.398v6.097h-3.234v-5.432c0-1.314-.027-3.004-1.854-3.004-1.855 0-2.14 1.435-2.14 2.92v5.516H9.762V8.796h2.748zM5.138 6.854a2.134 2.134 0 1 1 0-4.268 2.134 2.134 0 0 1 0 4.268zm1.835 11.925H3.303V8.796h3.67v9.983zM19.128 1H4.872C2.767 1 1 2.767 1 4.872v14.256C1 21.233 2.767 23 4.872 23h14.256C21.233 23 23 21.233 23 19.128V4.872C23 2.767 21.233 1 19.128 1z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-12 pt-8 border-t text-center transition-colors" :class="isDark ? 'border-cyan-300/10' : 'border-accent-primary/15'">
          <p class="text-sm transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-muted)]'">
            © {{ new Date().getFullYear() }} DashForge. All rights reserved. Made with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
