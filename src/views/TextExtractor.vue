<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useLikedTools } from '../composables/useLikedTools.js'

const { isDark } = useTheme()
const { isLiked, toggleLike } = useLikedTools()
const toolId = 'text-extractor'

const outputFormat = ref('txt')
const isDragging = ref(false)
const dragCounter = ref(0)
const fileInput = ref(null)
const showEditor = ref(false)

const file = ref(null)
const extractedText = ref('')
const status = ref('idle')
const error = ref(null)

const outputFormats = [
  { label: 'Plain Text (.txt)', value: 'txt', hint: 'Simple text format' },
  { label: 'Markdown (.md)', value: 'md', hint: 'With formatting' },
  { label: 'JSON (.json)', value: 'json', hint: 'Structured data' }
]

const hasResult = computed(() => status.value === 'done' && extractedText.value)

const resetWorkspace = () => {
  extractedText.value = ''
  file.value = null
  status.value = 'idle'
  error.value = null
  showEditor.value = false
}

const openFilePicker = () => {
  if (status.value === 'processing') return
  fileInput.value?.click()
}

const loadFile = (uploadedFile) => {
  resetWorkspace()
  file.value = {
    file: uploadedFile,
    name: uploadedFile.name,
    size: uploadedFile.size,
    type: uploadedFile.type
  }
  status.value = 'ready'
}

const handleFileSelect = (event) => {
  const uploadedFile = event.target.files?.[0]
  if (uploadedFile) loadFile(uploadedFile)
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
  const uploadedFile = event.dataTransfer.files?.[0]
  if (uploadedFile) loadFile(uploadedFile)
}

const extractText = async () => {
  if (!file.value?.file) return

  status.value = 'processing'
  error.value = null
  showEditor.value = false

  try {
    const fileType = file.value.file.type
    let text = ''

    // Handle different file types
    if (fileType === 'text/plain' || fileType === 'text/markdown' || 
        fileType === 'application/json' || fileType === 'text/html' ||
        fileType === 'text/xml' || fileType === 'text/css' ||
        fileType === 'application/javascript' || fileType === 'text/javascript') {
      // Text-based files
      text = await file.value.file.text()
    } else if (fileType === 'application/pdf') {
      // PDF files - basic text extraction
      text = await extractFromPDF(file.value.file)
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX files
      text = await extractFromDOCX(file.value.file)
    } else {
      // Try to read as text for other types
      try {
        text = await file.value.file.text()
      } catch (e) {
        throw new Error('Unsupported file type. Please upload a text, PDF, or DOCX file.')
      }
    }

    extractedText.value = text
    status.value = 'done'
  } catch (err) {
    status.value = 'error'
    error.value = err.message || 'Text extraction failed. Please try again.'
  }
}

const extractFromPDF = async (pdfFile) => {
  // Basic PDF text extraction
  // In a real implementation, you would use pdf.js or similar library
  // For now, return a placeholder message
  return '[PDF text extraction requires pdf.js library. This is a placeholder implementation.]'
}

const extractFromDOCX = async (docxFile) => {
  // Basic DOCX text extraction
  // In a real implementation, you would use mammoth.js or similar library
  // For now, return a placeholder message
  return '[DOCX text extraction requires mammoth.js library. This is a placeholder implementation.]'
}

const downloadResult = () => {
  if (!extractedText.value) return

  const baseName = file.value.name.replace(/\.[^.]+$/, '')
  let content = extractedText.value
  let mimeType = 'text/plain'
  let extension = 'txt'

  switch (outputFormat.value) {
    case 'md':
      mimeType = 'text/markdown'
      extension = 'md'
      break
    case 'json':
      mimeType = 'application/json'
      content = JSON.stringify({ text: extractedText.value, source: file.value.name }, null, 2)
      extension = 'json'
      break
    default:
      mimeType = 'text/plain'
      extension = 'txt'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}-extracted.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

const toggleEditor = () => {
  showEditor.value = !showEditor.value
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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
        Text Extractor
      </h1>
      <p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-secondary)]'">
        Extract text from documents, PDFs, and other files. Choose your output format and download the result.
      </p>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Workspace -->
      <div class="space-y-6">
        <!-- Drop zone -->
        <div
          v-if="!file"
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
            accept=".txt,.md,.pdf,.docx,.json,.html,.xml,.js,.ts,.css"
            class="hidden"
            @change="handleFileSelect"
          />

          <div class="px-6 py-12 sm:py-16 flex flex-col items-center text-center pointer-events-none">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              :class="isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p class="text-lg font-semibold text-slate-800">
              {{ isDragging ? 'Drop your file here' : 'Drag & drop a file' }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">
              or <span class="text-indigo-600 font-medium">click to browse</span>
            </p>
            <p class="mt-2 text-xs text-slate-400">
              Supports: TXT, MD, PDF, DOCX, JSON, HTML, XML, JS, TS, CSS
            </p>
          </div>
        </div>

        <div
          v-else
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div class="flex flex-col sm:flex-row">
            <div class="sm:w-64 shrink-0 bg-slate-100 p-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-slate-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div class="flex-1 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Uploaded file</p>
                <h2 class="mt-1 font-semibold text-slate-800 truncate" :title="file.name">
                  {{ file.name }}
                </h2>
                <p class="mt-1 text-sm text-slate-500">{{ formatBytes(file.size) }}</p>
              </div>
              <button
                type="button"
                :disabled="status === 'processing'"
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
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">OUTPUT FORMAT</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="format in outputFormats"
                  :key="format.value"
                  type="button"
                  :disabled="status === 'processing'"
                  @click="outputFormat = format.value"
                  class="px-3 py-2 rounded-xl text-left border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="outputFormat === format.value
                    ? 'border-indigo-300 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300'"
                >
                  <span class="block text-sm font-medium text-slate-800">{{ format.label }}</span>
                  <span class="block text-xs text-slate-400">{{ format.hint }}</span>
                </button>
              </div>
            </div>

            <div v-if="file" class="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                :disabled="status === 'processing'"
                @click="extractText"
                class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ hasResult ? 'Extract again' : 'Extract text' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Processing -->
        <div
          v-if="status === 'processing'"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12"
        >
          <div class="max-w-md mx-auto text-center">
            <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-7 h-7 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-slate-800">Extracting text...</h2>
            <p class="mt-1 text-sm text-slate-500">Please wait while we process your file.</p>
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
              @click="extractText"
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
              <h2 class="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md" :title="file.name">
                {{ file.name }}
              </h2>
              <p class="text-sm text-slate-500 mt-0.5">
                {{ formatBytes(file.size) }}
                <span v-if="extractedText"> → {{ extractedText.length }} characters extracted</span>
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
              {{ showEditor ? 'Hide editor' : 'Edit extracted text' }}
            </button>
          </div>

          <!-- Text editor -->
          <div v-if="showEditor" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Extracted text</p>
                <p class="text-sm text-slate-500">Edit the text before downloading.</p>
              </div>
            </div>
            <textarea
              v-model="extractedText"
              rows="15"
              class="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-60"
            />
          </div>

          <!-- Preview -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <p class="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              Preview
            </p>
            <div class="p-4 max-h-96 overflow-y-auto">
              <pre class="text-sm text-slate-700 whitespace-pre-wrap font-mono">{{ extractedText.substring(0, 2000) }}{{ extractedText.length > 2000 ? '...' : '' }}</pre>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              @click="extractText"
              class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              Re-extract
            </button>
            <button
              type="button"
              @click="downloadResult"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Download {{ outputFormat.toUpperCase() }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
