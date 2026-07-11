<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { categoryHasActiveTool } from '../config/tools.js'

const props = defineProps({
  category: { type: Object, required: true },
  openCategoryId: { type: String, default: null }
})

const emit = defineEmits(['navigate', 'toggle', 'close'])

const route = useRoute()

const isActive = computed(() => categoryHasActiveTool(props.category, route.name))
const isOpen = computed(() => props.openCategoryId === props.category.id)

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
        ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'"
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
      class="absolute right-0 top-full mt-2 w-52 rounded-xl border border-cyan-300/15 bg-slate-950/95 py-1.5 shadow-2xl shadow-cyan-950/40 backdrop-blur z-50"
    >
      <template v-for="tool in category.tools" :key="tool.label">
        <router-link
          v-if="tool.path"
          :to="tool.path"
          @click="handleNavigate"
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm transition-colors"
          :class="route.name === tool.routeName
            ? 'bg-cyan-400/10 text-cyan-200 font-medium'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'"
        >
          {{ tool.label }}
        </router-link>
        <span
          v-else
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm text-slate-500 cursor-not-allowed"
        >
          {{ tool.label }}
          <span class="text-[10px] uppercase tracking-wide font-semibold bg-fuchsia-400/10 text-fuchsia-200 px-1.5 py-0.5 rounded">
            Soon
          </span>
        </span>
      </template>
    </div>
  </div>
</template>
