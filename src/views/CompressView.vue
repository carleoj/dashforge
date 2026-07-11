<script setup>
import { ref, computed } from 'vue'
import {
  compressImage,
  formatBytes,
  getDownloadExtension,
  getOutputMimeType,
  isImageFile
} from '../utils/imageCompress.js'

const quality = ref(75)
const maxDimension = ref(1920)
const outputFormat = ref('auto')
const isDragging = ref(false)
const dragCounter = ref(0)
const files = ref([])
const fileInput = ref(null)

const presets = [
  { label: 'Light', quality: 85, hint: 'Minimal loss' },
  { label: 'Balanced', quality: 70, hint: 'Recommended' },
  { label: 'Strong', quality: 50, hint: 'Smaller files' },
  { label: 'Max', quality: 30, hint: 'Smallest size' }
]

const dimensionOptions = [
  { label: 'Original size', value: null },
  { label: 'Up to 2560px', value: 2560 },
  { label: 'Up to 1920px', value: 1920 },
  { label: 'Up to 1280px', value: 1280 },
  { label: 'Up to 800px', value: 800 }
]

const formatOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' }
]

const completedCount = computed(() => files.value.filter((f) => f.status === 'done').length)
const isCompressing = computed(() => files.value.some((f) => f.status === 'compressing'))
const totalSaved = computed(() => {
  return files.value.reduce((sum, f) => {
    if (f.status !== 'done' || !f.compressedSize) return sum
    return sum + Math.max(0, f.originalSize - f.compressedSize)
  }, 0)
})

const applyPreset = (preset) => {
  quality.value = preset.quality
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const addFiles = (fileList) => {
  const incoming = Array.from(fileList).filter(isImageFile)
  if (!incoming.length) return

  for (const file of incoming) {
    const id = crypto.randomUUID()
    files.value.push({
      id,
      file,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: null,
      outputMimeType: null,
      originalSize: file.size,
      compressedSize: null,
      status: 'pending',
      error: null
    })
  }
}

const handleFileSelect = (event) => {
  addFiles(event.target.files)
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
  addFiles(event.dataTransfer.files)
}

const revokeFileUrls = (entry) => {
  if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl)
  if (entry.compressedUrl) URL.revokeObjectURL(entry.compressedUrl)
}

const removeFile = (id) => {
  const index = files.value.findIndex((f) => f.id === id)
  if (index === -1) return
  revokeFileUrls(files.value[index])
  files.value.splice(index, 1)
}

const clearAll = () => {
  files.value.forEach(revokeFileUrls)
  files.value = []
}

const savingsPercent = (entry) => {
  if (!entry.compressedSize || !entry.originalSize) return 0
  return Math.round(((entry.originalSize - entry.compressedSize) / entry.originalSize) * 100)
}

const compressEntry = async (entry) => {
  entry.status = 'compressing'
  entry.error = null

  if (entry.compressedUrl) {
    URL.revokeObjectURL(entry.compressedUrl)
    entry.compressedUrl = null
    entry.compressedSize = null
    entry.outputMimeType = null
  }

  try {
    const mimeType = getOutputMimeType(entry.file, outputFormat.value)
    const blob = await compressImage(entry.file, {
      quality: quality.value,
      maxDimension: maxDimension.value,
      format: outputFormat.value
    })

    entry.compressedUrl = URL.createObjectURL(blob)
    entry.compressedSize = blob.size
    entry.outputMimeType = mimeType
    entry.status = 'done'
  } catch (err) {
    entry.status = 'error'
    entry.error = err.message || 'Compression failed'
  }
}

const compressAll = async () => {
  const pending = files.value.filter((f) => f.status !== 'compressing')
  await Promise.all(pending.map(compressEntry))
}

const downloadFile = (entry) => {
  if (!entry.compressedUrl) return

  const mimeType = entry.outputMimeType || getOutputMimeType(entry.file, outputFormat.value)
  const ext = getDownloadExtension(mimeType)
  const baseName = entry.name.replace(/\.[^.]+$/, '')

  const link = document.createElement('a')
  link.href = entry.compressedUrl
  link.download = `${baseName}-compressed.${ext}`
  link.click()
}

const downloadAll = () => {
  files.value.filter((f) => f.status === 'done').forEach(downloadFile)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
        Image Compressor
      </h1>
      <p class="mt-3 text-slate-500 text-base sm:text-lg">
        Drop your images here to shrink file size without leaving your browser.
        Adjust quality and dimensions to find the perfect balance.
      </p>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Main workspace -->
      <div class="space-y-6">
        <!-- Drop zone -->
        <div
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @click="openFilePicker"
          class="relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
          :class="isDragging
            ? 'border-indigo-400 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />

          <div class="px-6 py-12 sm:py-16 flex flex-col items-center text-center pointer-events-none">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors"
              :class="isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <p class="text-lg font-semibold text-slate-800">
              {{ isDragging ? 'Drop images to upload' : 'Drag & drop images here' }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">
              or <span class="text-indigo-600 font-medium">click to browse</span> — JPEG, PNG, WebP, GIF
            </p>
          </div>
        </div>

        <!-- Settings -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">Quality</h2>
                <span class="text-sm font-bold text-indigo-600 tabular-nums">{{ quality }}%</span>
              </div>
              <input
                v-model.number="quality"
                type="range"
                min="10"
                max="100"
                step="1"
                :disabled="isCompressing"
                class="w-full h-2 rounded-full appearance-none bg-slate-200 accent-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div class="flex justify-between mt-1.5 text-xs text-slate-400">
                <span>Smaller</span>
                <span>Better</span>
              </div>
            </div>

            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Presets</h2>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="preset in presets"
                  :key="preset.label"
                  type="button"
                  :disabled="isCompressing"
                  @click="applyPreset(preset)"
                  class="px-2.5 py-2 rounded-lg text-left border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="quality === preset.quality
                    ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <span class="block text-xs font-medium text-slate-800">{{ preset.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Max dimension</h2>
              <select
                v-model="maxDimension"
                :disabled="isCompressing"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option v-for="option in dimensionOptions" :key="option.label" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Output format</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in formatOptions"
                  :key="option.value"
                  type="button"
                  :disabled="isCompressing"
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
          </div>

          <div v-if="files.length" class="mt-5 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              :disabled="isCompressing"
              @click="compressAll"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ completedCount ? 'Re-compress images' : 'Compress images' }}
            </button>
          </div>
        </div>

        <!-- Results summary bar -->
        <div
          v-if="files.length"
          class="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm"
        >
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span class="font-medium text-slate-800">{{ files.length }} image{{ files.length === 1 ? '' : 's' }}</span>
            <span v-if="completedCount" class="text-emerald-600">
              {{ completedCount }} compressed
            </span>
            <span v-if="totalSaved > 0" class="text-slate-500">
              Saved {{ formatBytes(totalSaved) }} total
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="isCompressing"
              @click="compressAll"
              class="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ completedCount ? 'Re-compress all' : 'Compress all' }}
            </button>
            <button
              v-if="completedCount"
              type="button"
              @click="downloadAll"
              class="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Download all
            </button>
            <button
              type="button"
              @click="clearAll"
              class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- File cards -->
        <div v-if="files.length" class="space-y-4">
          <article
            v-for="entry in files"
            :key="entry.id"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div class="flex flex-col sm:flex-row">
              <!-- Previews -->
              <div class="flex sm:w-72 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100">
                <div class="flex-1 p-3">
                  <p class="text-xs font-medium text-slate-400 uppercase mb-2">Original</p>
                  <div class="aspect-video rounded-lg bg-slate-100 overflow-hidden">
                    <img
                      :src="entry.originalUrl"
                      :alt="entry.name"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <p class="mt-2 text-xs text-slate-500 tabular-nums">{{ formatBytes(entry.originalSize) }}</p>
                </div>

                <div class="flex-1 p-3">
                  <p class="text-xs font-medium text-slate-400 uppercase mb-2">Compressed</p>
                  <div class="aspect-video rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                    <img
                      v-if="entry.compressedUrl"
                      :src="entry.compressedUrl"
                      :alt="`${entry.name} compressed`"
                      class="w-full h-full object-contain"
                    />
                    <div v-else-if="entry.status === 'compressing'" class="flex flex-col items-center gap-2 text-slate-400">
                      <svg class="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span class="text-xs">Compressing…</span>
                    </div>
                    <span v-else class="text-xs text-slate-400">Waiting…</span>
                  </div>
                  <p v-if="entry.compressedSize" class="mt-2 text-xs text-slate-500 tabular-nums">
                    {{ formatBytes(entry.compressedSize) }}
                  </p>
                </div>
              </div>

              <!-- Details -->
              <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-medium text-slate-800 truncate" :title="entry.name">
                      {{ entry.name }}
                    </h3>
                    <button
                      type="button"
                      @click.stop="removeFile(entry.id)"
                      class="shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div v-if="entry.status === 'done'" class="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      :class="savingsPercent(entry) > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'"
                    >
                      {{ savingsPercent(entry) > 0 ? `−${savingsPercent(entry)}%` : 'No reduction' }}
                    </span>
                    <span v-if="savingsPercent(entry) > 0" class="text-xs text-slate-500">
                      saved {{ formatBytes(entry.originalSize - entry.compressedSize) }}
                    </span>
                  </div>

                  <p v-if="entry.status === 'error'" class="mt-2 text-sm text-red-600">
                    {{ entry.error }}
                  </p>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    v-if="entry.status === 'done'"
                    type="button"
                    @click.stop="downloadFile(entry)"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
                    </svg>
                    Download
                  </button>
                  <button
                    v-if="entry.status === 'error'"
                    type="button"
                    @click.stop="compressEntry(entry)"
                    class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty state hint -->
        <div v-else class="text-center py-8">
          <p class="text-sm text-slate-400">
            Your compressed images will appear here with before/after previews.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
