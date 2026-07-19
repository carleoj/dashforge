<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useLikedTools } from '../composables/useLikedTools.js'
import { PDFDocument } from 'pdf-lib'

const { isDark } = useTheme()
const { isLiked, toggleLike } = useLikedTools()
const toolId = 'pdf-compressor'

const compressionLevel = ref('medium')
const isDragging = ref(false)
const dragCounter = ref(0)
const fileInput = ref(null)

const file = ref(null)
const compressedFile = ref(null)
const status = ref('idle')
const error = ref(null)

const compressionOptions = [
  { label: 'Low', value: 'low', hint: 'Maximum compression, smaller file' },
  { label: 'Medium', value: 'medium', hint: 'Balanced compression' },
  { label: 'High', value: 'high', hint: 'Better quality, larger file' }
]

const hasResult = computed(() => status.value === 'done' && compressedFile.value)

const resetWorkspace = () => {
  compressedFile.value = null
  file.value = null
  status.value = 'idle'
  error.value = null
}

const openFilePicker = () => {
  if (status.value === 'processing') return
  fileInput.value?.click()
}

const loadFile = (uploadedFile) => {
  if (uploadedFile.type !== 'application/pdf') {
    error.value = 'Please upload a PDF file.'
    return
  }
  resetWorkspace()
  file.value = {
    file: uploadedFile,
    name: uploadedFile.name,
    size: uploadedFile.size,
    type: uploadedFile.type
  }
  status.value = 'ready'
  error.value = null
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

const compressPDF = async () => {
  if (!file.value?.file) return

  status.value = 'processing'
  error.value = null

  try {
    const sourceFile = file.value.file
    const level = compressionLevel.value

    // Load the PDF
    const arrayBuffer = await sourceFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // Get compression settings based on level
    let useObjectStreams = true
    let removeUnusedObjects = true
    let removeMetadata = true

    if (level === 'low') {
      // Maximum compression
      useObjectStreams = true
      removeUnusedObjects = true
      removeMetadata = true
    } else if (level === 'medium') {
      // Balanced compression
      useObjectStreams = true
      removeUnusedObjects = true
      removeMetadata = false
    } else {
      // High quality (less compression)
      useObjectStreams = false
      removeUnusedObjects = false
      removeMetadata = false
    }

    // Remove metadata if requested
    if (removeMetadata) {
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('DashForge PDF Compressor')
      pdfDoc.setCreator('DashForge')
    }

    // Remove unused objects
    if (removeUnusedObjects) {
      // pdf-lib automatically handles some cleanup, but we can force it
      // by creating a new document and copying pages
      const newPdfDoc = await PDFDocument.create()
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
      pages.forEach(page => newPdfDoc.addPage(page))
      
      // Save with compression settings
      const saveOptions = {
        useObjectStreams: useObjectStreams,
        addDefaultPage: false,
      }
      
      const compressedPdfBytes = await newPdfDoc.save(saveOptions)
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
      const compressedUrl = URL.createObjectURL(compressedBlob)
      
      compressedFile.value = {
        blob: compressedBlob,
        url: compressedUrl,
        name: sourceFile.name.replace('.pdf', '-compressed.pdf'),
        size: compressedBlob.size,
        originalSize: sourceFile.size,
        compressionRatio: compressedBlob.size / sourceFile.size
      }
    } else {
      // Save with compression settings without removing objects
      const saveOptions = {
        useObjectStreams: useObjectStreams,
        addDefaultPage: false,
      }
      
      const compressedPdfBytes = await pdfDoc.save(saveOptions)
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
      const compressedUrl = URL.createObjectURL(compressedBlob)
      
      compressedFile.value = {
        blob: compressedBlob,
        url: compressedUrl,
        name: sourceFile.name.replace('.pdf', '-compressed.pdf'),
        size: compressedBlob.size,
        originalSize: sourceFile.size,
        compressionRatio: compressedBlob.size / sourceFile.size
      }
    }

    status.value = 'done'
  } catch (err) {
    status.value = 'error'
    error.value = err.message || 'PDF compression failed. Please try again.'
  }
}

const downloadResult = () => {
  if (!compressedFile.value?.url) return

  const link = document.createElement('a')
  link.href = compressedFile.value.url
  link.download = compressedFile.value.name
  link.click()
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const calculateSavings = () => {
  if (!compressedFile.value) return 0
  const savings = ((1 - compressedFile.value.compressionRatio) * 100).toFixed(1)
  return savings
}

onBeforeUnmount(() => {
  if (compressedFile.value?.url) {
    URL.revokeObjectURL(compressedFile.value.url)
  }
})
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
        PDF Compressor
      </h1>
      <p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? 'text-slate-500' : 'text-[var(--text-secondary)]'">
        Compress PDF files to reduce file size while maintaining quality. Upload your PDF and choose compression level.
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
            accept=".pdf"
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
              {{ isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF' }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">
              or <span class="text-indigo-600 font-medium">click to browse</span>
            </p>
            <p class="mt-2 text-xs text-slate-400">
              Supports: PDF files only
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
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Uploaded PDF</p>
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
              <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">COMPRESSION LEVEL</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in compressionOptions"
                  :key="option.value"
                  type="button"
                  :disabled="status === 'processing'"
                  @click="compressionLevel = option.value"
                  class="px-3 py-2 rounded-xl text-left border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="compressionLevel === option.value
                    ? 'border-indigo-300 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300'"
                >
                  <span class="block text-sm font-medium text-slate-800">{{ option.label }}</span>
                  <span class="block text-xs text-slate-400">{{ option.hint }}</span>
                </button>
              </div>
            </div>

            <div v-if="file" class="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                :disabled="status === 'processing'"
                @click="compressPDF"
                class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ hasResult ? 'Compress again' : 'Compress PDF' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="bg-white rounded-2xl border border-red-200 shadow-sm p-8"
        >
          <div class="max-w-lg mx-auto text-center">
            <p class="text-red-600 font-medium">{{ error }}</p>
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
            <h2 class="text-lg font-semibold text-slate-800">Compressing PDF...</h2>
            <p class="mt-1 text-sm text-slate-500">Please wait while we compress your file.</p>
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
                <span v-if="compressedFile"> → {{ formatBytes(compressedFile.size) }} ({{ calculateSavings() }}% smaller)</span>
              </p>
            </div>
          </div>

          <!-- Compressed file info -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <p class="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              Compressed PDF
            </p>
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-slate-800">{{ compressedFile.name }}</p>
                  <p class="text-sm text-slate-500">{{ formatBytes(compressedFile.size) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="compressPDF"
                  class="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  Re-compress
                </button>
                <button
                  type="button"
                  @click="downloadResult"
                  class="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
