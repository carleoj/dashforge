<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  restoreUrl: { type: String, required: true }
})

const emit = defineEmits(['update'])

const containerRef = ref(null)
const canvasRef = ref(null)
const tool = ref('erase')
const brushSize = ref(24)
const isDrawing = ref(false)
const lastPoint = ref(null)

let image = null
let restoreImage = null
let ctx = null

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })

const initCanvas = async () => {
  if (!canvasRef.value || !props.imageUrl) return

  image = await loadImage(props.imageUrl)
  restoreImage = await loadImage(props.restoreUrl)

  const canvas = canvasRef.value
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  emitUpdate()
}

const getCanvasPoint = (event) => {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height
  }
}

const drawDot = (x, y) => {
  const radius = brushSize.value / 2

  if (tool.value === 'erase') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  } else {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(restoreImage, 0, 0, canvasRef.value.width, canvasRef.value.height)
    ctx.restore()
  }
}

const drawLine = (from, to) => {
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const step = Math.max(1, brushSize.value / 4)
  const steps = Math.ceil(dist / step)

  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps
    drawDot(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)
  }
}

const startDraw = (event) => {
  event.preventDefault()
  isDrawing.value = true
  lastPoint.value = getCanvasPoint(event)
  drawDot(lastPoint.value.x, lastPoint.value.y)
}

const moveDraw = (event) => {
  if (!isDrawing.value) return
  event.preventDefault()
  const point = getCanvasPoint(event)
  drawLine(lastPoint.value, point)
  lastPoint.value = point
}

const endDraw = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
  lastPoint.value = null
  emitUpdate()
}

const emitUpdate = () => {
  if (!canvasRef.value) return
  canvasRef.value.toBlob((blob) => {
    if (blob) emit('update', blob)
  }, 'image/png')
}

const resetCanvas = async () => {
  if (!ctx || !image) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.drawImage(image, 0, 0)
  emitUpdate()
}

const exportBlob = () =>
  new Promise((resolve) => {
    canvasRef.value?.toBlob((blob) => resolve(blob), 'image/png')
  })

defineExpose({ resetCanvas, exportBlob })

onMounted(initCanvas)
onBeforeUnmount(() => {
  image = null
  restoreImage = null
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
        <button
          type="button"
          @click="tool = 'erase'"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="tool === 'erase' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-3.362m-12.952 8.379a2.25 2.25 0 0 1-2.4-2.245 4.5 4.5 0 0 0 8.4 2.245 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 1-8.4-2.245 2.25 2.25 0 0 1 2.4-2.245 4.5 4.5 0 0 0-8.4 2.245Z" />
          </svg>
          Eraser
        </button>
        <button
          type="button"
          @click="tool = 'restore'"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="tool === 'restore' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          Restore
        </button>
      </div>

      <div class="flex items-center gap-3 flex-1 min-w-[200px]">
        <label class="text-sm text-slate-600 shrink-0">Brush</label>
        <input
          v-model.number="brushSize"
          type="range"
          min="6"
          max="80"
          step="1"
          class="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-indigo-600 cursor-pointer"
        />
        <span class="text-sm font-medium text-slate-700 tabular-nums w-10 text-right">{{ brushSize }}px</span>
      </div>

      <button
        type="button"
        @click="resetCanvas"
        class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        Reset edits
      </button>
    </div>

    <p class="text-xs text-slate-500">
      Use the eraser to clean leftover background. Switch to restore if you remove part of your subject by mistake.
    </p>

    <div
      ref="containerRef"
      class="rounded-2xl border border-slate-200 overflow-hidden checkerboard shadow-inner"
    >
      <canvas
        ref="canvasRef"
        class="block max-w-full mx-auto cursor-crosshair touch-none"
        @mousedown="startDraw"
        @mousemove="moveDraw"
        @mouseup="endDraw"
        @mouseleave="endDraw"
        @touchstart="startDraw"
        @touchmove="moveDraw"
        @touchend="endDraw"
      />
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
