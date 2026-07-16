<script setup>
import { computed, ref } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useLikedTools } from '../composables/useLikedTools.js'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  toolId: { type: String, required: true },
  placeholder: { type: String, default: 'Paste or type your text here...' },
  fileAccept: { type: String, default: '.txt,.md,.csv,.json,.html,.xml,.js,.ts,.vue,.css,.scss' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const { isDark } = useTheme()
const { isLiked, toggleLike } = useLikedTools()
const textValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isDragging = ref(false)
const dragCounter = ref(0)
const fileInput = ref(null)
const fileError = ref('')

const openFilePicker = () => {
  fileInput.value?.click()
}

const readTextFile = async (file) => {
  try {
    const content = await file.text()
    emit('update:modelValue', content)
    fileError.value = ''
  } catch (error) {
    fileError.value = error?.message || 'Unable to read this file.'
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    await readTextFile(file)
  }
  event.target.value = ''
}

const handleDragEnter = (event) => {
  event.preventDefault()
  dragCounter.value += 1
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  dragCounter.value -= 1
  if (dragCounter.value <= 0) {
    dragCounter.value = 0
    isDragging.value = false
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = async (event) => {
  event.preventDefault()
  dragCounter.value = 0
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await readTextFile(file)
  }
}

const clearText = () => {
  emit('update:modelValue', '')
  fileError.value = ''
}
</script>

<template>
  <div class="space-y-8">
    <div class="text-center max-w-2xl mx-auto relative">
      <button
        @click="toggleLike(toolId)"
        class="absolute top-0 right-0 p-2 rounded-lg transition-colors cursor-pointer"
        :class="isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/10 text-slate-600'"
        aria-label="Like tool"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :fill="isLiked(toolId) ? 'currentColor' : 'none'"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-6 h-6 transition-colors"
          :class="isLiked(toolId) ? (isDark ? 'text-pink-400' : 'text-pink-500') : ''"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </button>

      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight transition-colors" :class="isDark ? 'text-slate-900' : 'text-[#1a1a1a]'">
        {{ title }}
      </h1>
      <p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? 'text-slate-500' : 'text-(--text-secondary)'">
        {{ subtitle }}
      </p>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <div
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        class="rounded-2xl border border-slate-300 bg-white overflow-hidden transition-all"
        :class="isDragging ? 'border-indigo-400 bg-indigo-50/70' : 'border-slate-300 bg-white'"
      >
        <div class="flex flex-col lg:flex-row">
          <button
            type="button"
            @click="openFilePicker"
            class="w-full lg:w-14 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-400 bg-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center py-3 lg:py-0 min-h-12 cursor-pointer"
            aria-label="Add a text file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6 text-slate-100 transition-colors hover:text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <div class="flex-1 p-3 sm:p-4">
            <div class="flex items-center justify-between gap-3 mb-2.5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Text input</p>
                <p class="text-sm text-slate-500">Drop in a text file or start typing below.</p>
              </div>
              <button
                type="button"
                @click="clearText"
                class="px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            <textarea
              v-model="textValue"
              rows="10"
              :placeholder="placeholder"
              class="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-44"
            />

            <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p class="text-sm text-slate-500">
                Supports plain text files such as .txt, .md, .csv, .json, and code files.
              </p>
              <p v-if="fileError" class="text-sm text-rose-600">{{ fileError }}</p>
            </div>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          :accept="fileAccept"
          @change="handleFileSelect"
        />
      </div>

      <div class="space-y-4">
        <slot name="toolbar" />
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
