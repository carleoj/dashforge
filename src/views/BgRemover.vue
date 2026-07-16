<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import EraserCanvas from '../components/EraserCanvas.vue'
import { isImageFile, formatBytes } from '../utils/imageCompress.js'
import { removeImageBackground } from '../utils/backgroundRemoval.js'
import { useTheme } from '../composables/useTheme.js'

const { isDark } = useTheme()
import { useLikedTools } from '../composables/useLikedTools.js'

const { isLiked, toggleLike } = useLikedTools()
const toolId = 'bg-remover'

const model = ref('balanced')
const isDragging = ref(false)
const dragCounter = ref(0)
const fileInput = ref(null)
const eraserRef = ref(null)
const showEditor = ref(false)

const image = ref(null)
const status = ref('idle')
const progress = ref(0)
const progressStage = ref('')
const processingMessageIndex = ref(0)
const processingMessageTimer = ref(null)
const error = ref(null)

const modelOptions = [
  { label: 'Fast', value: 'fast', hint: 'Quicker, lighter' },
  { label: 'Balanced', value: 'balanced', hint: 'Recommended' },
  { label: 'Quality', value: 'quality', hint: 'Best edges' }
]

const processingMessages = [
  'Reading the image and preparing the mask.',
  'Finding the subject edges.',
  'Separating the foreground from the background.',
  'Refining hair, fabric, and soft details.',
  'Compositing the transparent PNG.'
]

const hasResult = computed(() => status.value === 'done' && image.value?.resultUrl)
const isProcessing = computed(() => status.value === 'processing')
const processingMessage = computed(() => processingMessages[processingMessageIndex.value])

const stopProcessingMessages = () => {
  if (!processingMessageTimer.value) return
  clearInterval(processingMessageTimer.value)
  processingMessageTimer.value = null
}

const startProcessingMessages = () => {
  stopProcessingMessages()
  processingMessageIndex.value = 0
  processingMessageTimer.value = setInterval(() => {
    processingMessageIndex.value = (processingMessageIndex.value + 1) % processingMessages.length
  }, 2200)
}

const revokeUrls = (entry) => {
  if (!entry) return
  if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl)
  if (entry.resultUrl) URL.revokeObjectURL(entry.resultUrl)
  if (entry.resultBaseUrl) URL.revokeObjectURL(entry.resultBaseUrl)
  if (entry.editedUrl) URL.revokeObjectURL(entry.editedUrl)
}

const resetWorkspace = () => {
  stopProcessingMessages()
  revokeUrls(image.value)
  image.value = null
  status.value = 'idle'
  progress.value = 0
  progressStage.value = ''
  error.value = null
  showEditor.value = false
  startProcessingMessages()
}

const openFilePicker = () => {
  if (isProcessing.value) return
  fileInput.value?.click()
}

const loadFile = (file) => {
  if (!isImageFile(file)) return

  resetWorkspace()
  image.value = {
    file,
    name: file.name,
    originalSize: file.size,
    originalUrl: URL.createObjectURL(file),
    resultUrl: null,
    resultBaseUrl: null,
    editedUrl: null,
    resultSize: null
  }
  status.value = 'ready'
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) loadFile(file)
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

const handleDrop = (event) => {
  event.preventDefault()
  dragCounter.value = 0
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) loadFile(file)
}

const processImage = async () => {
  if (!image.value?.file) return

  status.value = 'processing'
  progress.value = 0
  progressStage.value = 'Preparing…'
  error.value = null
  showEditor.value = false

  if (image.value.resultUrl) URL.revokeObjectURL(image.value.resultUrl)
  if (image.value.resultBaseUrl) URL.revokeObjectURL(image.value.resultBaseUrl)
  image.value.resultUrl = null
  image.value.resultBaseUrl = null
  image.value.editedUrl = null

  try {
    const blob = await removeImageBackground(image.value.file, {
      model: model.value,
      onProgress: ({ stage, percent }) => {
        progressStage.value = stage
        progress.value = percent
      }
    })

    const resultUrl = URL.createObjectURL(blob)
    image.value.resultUrl = resultUrl
    image.value.resultBaseUrl = resultUrl
    image.value.resultSize = blob.size
    status.value = 'done'
    progress.value = 100
    stopProcessingMessages()
  } catch (err) {
    status.value = 'error'
    error.value = err.message || 'Background removal failed. Please try again.'
    stopProcessingMessages()
  }
}

const handleEditorUpdate = (blob) => {
  if (!image.value) return
  if (image.value.editedUrl) URL.revokeObjectURL(image.value.editedUrl)
  image.value.editedUrl = URL.createObjectURL(blob)
  image.value.resultUrl = image.value.editedUrl
  image.value.resultSize = blob.size
}

const downloadResult = () => {
  if (!image.value?.resultUrl) return

  const baseName = image.value.name.replace(/\.[^.]+$/, '')
  const link = document.createElement('a')
  link.href = image.value.resultUrl
  link.download = `${baseName}-no-bg.png`
  link.click()
}

const toggleEditor = () => {
  showEditor.value = !showEditor.value
}

onBeforeUnmount(resetWorkspace)
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
        Background Remover
      </h1>
      <p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-secondary)]'">
        Upload a photo and remove the background instantly in your browser.
        Refine edges with the eraser when needed.
      </p>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Workspace -->
      <div class="space-y-6">
        <!-- Drop zone -->
        <div
          v-if="!image"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @click="openFilePicker"
          class="rounded-2xl border-2 border-dashed transition-all cursor-pointer"
          :class="isDragging
            ? 'border-indigo-400 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-indigo-300'"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />

          <div class="px-6 py-12 sm:py-16 flex flex-col items-center text-center pointer-events-none">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              :class="isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H5.25A2.25 2.25 0 0 0 3 5.25v13.5A2.25 2.25 0 0 0 5.25 21Z" />
              </svg>
            </div>
            <p class="text-lg font-semibold text-slate-800">
              {{ isDragging ? 'Drop your image here' : 'Drag & drop an image' }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">
              or <span class="text-indigo-600 font-medium">click to browse</span>
            </p>
          </div>
        </div>

        <div
          v-else
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div class="flex flex-col sm:flex-row">
            <div class="sm:w-64 shrink-0 bg-slate-100 p-4 flex items-center justify-center">
              <img
                :src="image.originalUrl"
                :alt="image.name"
                class="max-h-48 sm:max-h-36 max-w-full object-contain rounded-lg"
              />
            </div>
            <div class="flex-1 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Uploaded image</p>
                <h2 class="mt-1 font-semibold text-slate-800 truncate" :title="image.name">
                  {{ image.name }}
                </h2>
                <p class="mt-1 text-sm text-slate-500">{{ formatBytes(image.originalSize) }}</p>
              </div>
              <button
                type="button"
                :disabled="isProcessing"
                @click="resetWorkspace"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload new
              </button>
            </div>
          </div>
        </div>

        <!-- Settings bar -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">SETTINGS</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in modelOptions"
                  :key="option.value"
                  type="button"
                  :disabled="isProcessing"
                  @click="model = option.value"
                  class="px-3 py-2 rounded-xl text-left border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="model === option.value
                    ? 'border-indigo-300 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300'"
                >
                  <span class="block text-sm font-medium text-slate-800">{{ option.label }}</span>
                  <span class="block text-xs text-slate-400">{{ option.hint }}</span>
                </button>
              </div>
            </div>

            <div v-if="image" class="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                :disabled="isProcessing"
                @click="processImage"
                class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ hasResult ? 'Remove background again' : 'Remove background' }}
              </button>
              <button
                v-if="hasResult"
                type="button"
                @click="downloadResult"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>

        <!-- Processing -->
        <div
          v-if="isProcessing"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12"
        >
          <div class="max-w-md mx-auto text-center">
            <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-7 h-7 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-slate-800">Removing background...</h2>
            <p class="mt-1 text-sm text-slate-500">{{ processingMessage }}</p>
            <p class="mt-1 text-xs text-slate-400 truncate">{{ progressStage }}</p>

            <div class="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                :style="{ width: `${Math.max(progress, 4)}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-slate-400 tabular-nums">{{ progress }}%</p>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="status === 'error'"
          class="bg-white rounded-2xl border border-red-200 shadow-sm p-8"
        >
          <div class="max-w-lg mx-auto text-center">
            <p class="text-red-600 font-medium">{{ error }}</p>
            <button
              type="button"
              @click="processImage"
              class="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>

        <!-- Results -->
        <template v-if="hasResult">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md" :title="image.name">
                {{ image.name }}
              </h2>
              <p class="text-sm text-slate-500 mt-0.5">
                {{ formatBytes(image.originalSize) }}
                <span v-if="image.resultSize"> → {{ formatBytes(image.resultSize) }} PNG</span>
              </p>
            </div>
            <button
              type="button"
              @click="toggleEditor"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              :class="showEditor
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'border border-slate-200 text-slate-700'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              {{ showEditor ? 'Hide eraser' : 'Refine with eraser' }}
            </button>
          </div>

          <!-- Eraser editor -->
          <div v-if="showEditor" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <EraserCanvas
              ref="eraserRef"
              :key="`${image.resultBaseUrl}-${showEditor}`"
              :image-url="image.editedUrl || image.resultBaseUrl"
              :restore-url="image.resultBaseUrl"
              @update="handleEditorUpdate"
            />
          </div>

          <!-- Before / after preview -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <p class="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                Original
              </p>
              <div class="aspect-square bg-slate-100 flex items-center justify-center p-4">
                <img
                  :src="image.originalUrl"
                  :alt="image.name"
                  class="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <p class="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                Background removed
              </p>
              <div class="aspect-square checkerboard flex items-center justify-center p-4">
                <img
                  :src="image.resultUrl"
                  :alt="`${image.name} without background`"
                  class="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              @click="processImage"
              class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              :class="isDark ? 'hover:bg-slate-50' : ''"
            >
              Re-process
            </button>
            <button
              type="button"
              @click="downloadResult"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Download PNG
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkerboard {
  background-color: #f8fafc;
  background-image:
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
</style>
