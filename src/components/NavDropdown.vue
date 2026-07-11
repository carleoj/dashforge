<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { categoryHasActiveTool } from '../config/tools.js'

const props = defineProps({
  category: { type: Object, required: true }
})

const emit = defineEmits(['navigate'])

const route = useRoute()
const isOpen = ref(false)
const rootRef = ref(null)

const isActive = computed(() => categoryHasActiveTool(props.category, route.name))

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const handleNavigate = () => {
  close()
  emit('navigate')
}

const onDocumentClick = (event) => {
  if (!rootRef.value?.contains(event.target)) close()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      @click.stop="toggle"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      :class="isActive || isOpen
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-600 hover:bg-slate-100'"
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
      class="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50"
    >
      <template v-for="tool in category.tools" :key="tool.label">
        <router-link
          v-if="tool.path"
          :to="tool.path"
          @click="handleNavigate"
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm transition-colors"
          :class="route.name === tool.routeName
            ? 'bg-indigo-50 text-indigo-600 font-medium'
            : 'text-slate-700 hover:bg-slate-50'"
        >
          {{ tool.label }}
        </router-link>
        <span
          v-else
          class="flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-sm text-slate-400 cursor-not-allowed"
        >
          {{ tool.label }}
          <span class="text-[10px] uppercase tracking-wide font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            Soon
          </span>
        </span>
      </template>
    </div>
  </div>
</template>
