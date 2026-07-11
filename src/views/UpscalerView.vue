<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import {
  formatBytes,
  getDownloadExtension,
  getOutputMimeType,
  isImageFile
} from '../utils/imageCompress.js'
import { upscaleImage } from '../utils/imageUpscale.js'

const scale = ref(2)
const outputFormat = ref('auto')
const quality = ref(92)
const sharpen = ref(true)
const isDragging = ref(false)
const dragCounter = ref(0)
const fileInput = ref(null)

const image = ref(null)
const status = ref('idle')
const processingMessageIndex = ref(0)
const processingMessageTimer = ref(null)
const error = ref(null)

const scaleOptions = [
  { label: '2x', value: 2, hint: 'Clean boost' },
  { label: '3x', value: 3, hint: 'Large screens' },
  { label: '4x', value: 4, hint: 'Max detail' }
]

const formatOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' }
]

const processingMessages = [
  'Reading the source pixels.',
  'Expanding the canvas resolution.',
  'Smoothing enlarged details.',
  'Rebuilding edges for a cleaner result.',
  'Encoding the upscaled image.'
]

const hasResult = computed(() => status.value === 'done' && image.value?.resultUrl)
const isProcessing = computed(() => status.value === 'processing')
const processingMessage = computed(() => processingMessages[processingMessageIndex.value])
const resultDimensions = computed(() => {
  if (!image.value?.resultWidth || !image.value?.resultHeight) return ''
  return `${image.value.resultWidth} x ${image.value.resultHeight}px`
})
const originalDimensions = computed(() => {
  if (!image.value?.originalWidth || !image.value?.originalHeight) return ''
  return `${image.value.originalWidth} x ${image.value.originalHeight}px`
})

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
  }, 2000)
}

const revokeUrls = (entry) => {
  if (!entry) return
  if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl)
  if (entry.resultUrl) URL.revokeObjectURL(entry.resultUrl)
}

const resetWorkspace = () => {
  stopProcessingMessages()
  revokeUrls(image.value)
  image.value = null
  status.value = 'idle'
  error.value = null
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
    resultSize: null,
    originalWidth: null,
    originalHeight: null,
    resultWidth: null,
    resultHeight: null
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
  error.value = null
  startProcessingMessages()

  if (image.value.resultUrl) {
    URL.revokeObjectURL(image.value.resultUrl)
    image.value.resultUrl = null
    image.value.resultSize = null
  }

  try {
    const mimeType = getOutputMimeType(image.value.file, outputFormat.value)
    const result = await upscaleImage(image.value.file, {
      scale: scale.value,
      sharpen: sharpen.value,
      format: mimeType,
      quality: quality.value / 100
    })

    image.value.resultUrl = URL.createObjectURL(result.blob)
    image.value.resultSize = result.blob.size
    image.value.originalWidth = result.originalWidth
    image.value.originalHeight = result.originalHeight
    image.value.resultWidth = result.width
    image.value.resultHeight = result.height
    status.value = 'done'
    stopProcessingMessages()
  } catch (err) {
    status.value = 'error'
    error.value = err.message || 'Upscale failed. Please try again.'
    stopProcessingMessages()
  }
}

const downloadResult = () => {
  if (!image.value?.resultUrl) return

  const mimeType = getOutputMimeType(image.value.file, outputFormat.value)
  const ext = getDownloadExtension(mimeType)
  const baseName = image.value.name.replace(/\.[^.]+$/, '')

  const link = document.createElement('a')
  link.href = image.value.resultUrl
  link.download = `${baseName}-${scale.value}x-upscaled.${ext}`
  link.click()
}

onBeforeUnmount(resetWorkspace)
</script>

<template>
  <div class="space-y-8">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
        Image Upscaler
      </h1>
      <p class="mt-3 text-slate-500 text-base sm:text-lg">
        Drop in an image, choose how far to scale it, and export a sharper,
        larger version directly from your browser.
      </p>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <div class="space-y-6">
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
            : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'"
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
              class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors"
              :class="isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v9A2.25 2.25 0 0 1 18.75 18.75H5.25A2.25 2.25 0 0 1 3 16.5v-9Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="m3 15 4.409-4.409a2.25 2.25 0 0 1 3.182 0L15 15m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0L21 15m-5.25-6.75h.008v.008h-.008V8.25Z" />
              </svg>
            </div>
            <p class="text-lg font-semibold text-slate-800">
              {{ isDragging ? 'Drop your image here' : 'Drag & drop an image' }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">
              or <span class="text-indigo-600 font-medium">click to browse</span> - JPEG, PNG, WebP, GIF
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
                class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload new
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Scale</h2>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in scaleOptions"
                  :key="option.value"
                  type="button"
                  :disabled="isProcessing"
                  @click="scale = option.value"
                  class="px-2.5 py-2 rounded-lg text-left border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="scale === option.value
                    ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <span class="block text-sm font-medium text-slate-800">{{ option.label }}</span>
                  <span class="block text-xs text-slate-400">{{ option.hint }}</span>
                </button>
              </div>
            </div>

            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Output format</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in formatOptions"
                  :key="option.value"
                  type="button"
                  :disabled="isProcessing"
                  @click="outputFormat = option.value"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="outputFormat === option.value
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">Quality</h2>
                <span class="text-sm font-bold text-indigo-600 tabular-nums">{{ quality }}%</span>
              </div>
              <input
                v-model.number="quality"
                type="range"
                min="60"
                max="100"
                step="1"
                :disabled="isProcessing"
                class="w-full h-2 rounded-full appearance-none bg-slate-200 accent-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div class="flex justify-between mt-1.5 text-xs text-slate-400">
                <span>Smaller</span>
                <span>Cleaner</span>
              </div>
            </div>

            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Detail</h2>
              <button
                type="button"
                :disabled="isProcessing"
                @click="sharpen = !sharpen"
                class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="sharpen
                  ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
              >
                <span class="text-left">
                  <span class="block text-sm font-medium text-slate-800">Sharpen edges</span>
                  <span class="block text-xs text-slate-400">Crisper result</span>
                </span>
                <span
                  class="relative w-10 h-6 rounded-full transition-colors"
                  :class="sharpen ? 'bg-indigo-600' : 'bg-slate-200'"
                >
                  <span
                    class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    :class="sharpen ? 'translate-x-4' : 'translate-x-0'"
                  />
                </span>
              </button>
            </div>
          </div>

          <div v-if="image" class="mt-5 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              :disabled="isProcessing"
              @click="processImage"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ hasResult ? 'Upscale again' : 'Upscale image' }}
            </button>
          </div>
        </div>

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
            <h2 class="text-lg font-semibold text-slate-800">Upscaling image...</h2>
            <p class="mt-1 text-sm text-slate-500">{{ processingMessage }}</p>
            <p class="mt-1 text-xs text-slate-400">
              Building a {{ scale }}x version with high-quality canvas smoothing.
            </p>
            <div class="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full w-2/3 bg-indigo-600 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div
          v-if="status === 'error'"
          class="bg-white rounded-2xl border border-red-200 shadow-sm p-8"
        >
          <div class="max-w-lg mx-auto text-center">
            <p class="text-red-600 font-medium">{{ error }}</p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                @click="processImage"
                class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                @click="resetWorkspace"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Upload new
              </button>
            </div>
          </div>
        </div>

        <template v-if="hasResult">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md" :title="image.name">
                {{ image.name }}
              </h2>
              <p class="text-sm text-slate-500 mt-0.5">
                {{ originalDimensions }} - {{ formatBytes(image.originalSize) }}
                <span v-if="resultDimensions"> to {{ resultDimensions }} - {{ formatBytes(image.resultSize) }}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                @click="resetWorkspace"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Upload new
              </button>
              <button
                type="button"
                @click="downloadResult"
                class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>

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
                Upscaled {{ scale }}x
              </p>
              <div class="aspect-square bg-slate-100 flex items-center justify-center p-4">
                <img
                  :src="image.resultUrl"
                  :alt="`${image.name} upscaled`"
                  class="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              @click="processImage"
              class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Re-process
            </button>
            <button
              type="button"
              @click="downloadResult"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Download upscaled image
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
