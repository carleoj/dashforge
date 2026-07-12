<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { categoryHasActiveTool } from '../config/tools.js'
import { useTheme } from '../composables/useTheme.js'
import { useLikedTools } from '../composables/useLikedTools.js'

const props = defineProps({
  category: { type: Object, required: true },
  openCategoryId: { type: String, default: null }
})

const emit = defineEmits(['navigate', 'toggle', 'close'])

const route = useRoute()
const { isDark } = useTheme()
const { isLiked } = useLikedTools()

const isActive = computed(() => categoryHasActiveTool(props.category, route.name))
const isOpen = computed(() => props.openCategoryId === props.category.id)

// Sort tools to show liked tools first
const sortedTools = computed(() => {
  return [...props.category.tools].sort((a, b) => {
    const aLiked = a.id && isLiked(a.id)
    const bLiked = b.id && isLiked(b.id)
    if (aLiked && !bLiked) return -1
    if (!aLiked && bLiked) return 1
    return 0
  })
})

const toggle = () => {
  emit('toggle', props.category.id)
}

const close = () => {
  emit('close')
}

const handleNavigate = () => {
  close()
  emit('navigate')
}

const onDocumentClick = (event) => {
  if (!event.target.closest('[data-nav-dropdown]')) close()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div class="relative" data-nav-dropdown>
    <button
      type="button"
      @click.stop="toggle"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      :class="isActive || isOpen
        ? (isDark ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20' : 'bg-accent-primary/10 text-[var(--accent-primary)] ring-1 ring-accent-primary/20')
        : (isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-[var(--text-primary)] hover:bg-black/5 hover:text-[var(--text-primary)]')"
      :aria-expanded="isOpen"
    >
      {{ category.label }}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-52 rounded-xl border py-1.5 shadow-2xl backdrop-blur z-50 transition-colors"
      :class="isDark ? 'border-cyan-300/15 bg-slate-950/95 shadow-cyan-950/40' : 'border-accent-primary/15 bg-[var(--bg-secondary)] shadow-black/20'"
    >
      <template v-for="tool in sortedTools" :key="tool.label">
        <router-link
          v-if="tool.path"
          :to="tool.path"
          @click="handleNavigate"
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm transition-colors"
          :class="route.name === tool.routeName
            ? (isDark ? 'bg-cyan-400/10 text-cyan-200' : 'bg-accent-primary/10 text-accent-primary') + ' font-medium'
            : (isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]')"
        >
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
        <span
          v-else
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm cursor-not-allowed transition-colors"
          :class="isDark ? 'text-slate-500' : 'text-[var(--text-muted)]'"
        >
          {{ tool.label }}
          <span class="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded transition-colors" :class="isDark ? 'bg-fuchsia-400/10 text-fuchsia-200' : 'bg-[var(--coming-soon-bg)] text-[var(--coming-soon-text)]'">
            Soon
          </span>
        </span>
      </template>
    </div>
  </div>
</template>
