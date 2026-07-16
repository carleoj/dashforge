<script setup>
import { computed, ref } from 'vue'
import TextToolWorkspace from '../components/TextToolWorkspace.vue'
import { useTheme } from '../composables/useTheme.js'

const { isDark } = useTheme()
const text = ref('')
const toolId = 'case-converter'

const caseModes = [
  { id: 'sentence', label: 'Sentence case' },
  { id: 'lower', label: 'lowercase' },
  { id: 'upper', label: 'UPPERCASE' },
  { id: 'title', label: 'Title Case' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' }
]

const selectedMode = ref('sentence')

const convertedText = computed(() => {
  if (!text.value) return ''

  const source = text.value.replace(/\r\n/g, '\n')
  const words = source
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)

  switch (selectedMode.value) {
    case 'lower':
      return source.toLowerCase()
    case 'upper':
      return source.toUpperCase()
    case 'title': {
      const titleWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      return titleWords.join(' ')
    }
    case 'camel': {
      const camelWords = words.map((word, index) => {
        const cleaned = word.replace(/[^a-zA-Z0-9]+/g, '')
        if (!cleaned) return ''
        return index === 0 ? cleaned.toLowerCase() : cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
      }).filter(Boolean)
      return camelWords.join('')
    }
    case 'pascal': {
      const pascalWords = words.map((word) => {
        const cleaned = word.replace(/[^a-zA-Z0-9]+/g, '')
        return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : ''
      }).filter(Boolean)
      return pascalWords.join('')
    }
    case 'snake': {
      const snakeWords = words.map((word) => word.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()).filter(Boolean)
      return snakeWords.join('_')
    }
    case 'kebab': {
      const kebabWords = words.map((word) => word.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()).filter(Boolean)
      return kebabWords.join('-')
    }
    case 'sentence':
    default: {
      const paragraphs = source.split(/\n+/)
      return paragraphs.map((paragraph) => {
        const wordsInParagraph = paragraph.trim().split(/\s+/).filter(Boolean)
        if (!wordsInParagraph.length) return paragraph
        return wordsInParagraph.map((word, index) => {
          if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          }
          return word.toLowerCase()
        }).join(' ')
      }).join('\n')
    }
  }
})
</script>

<template>
  <TextToolWorkspace
    v-model="text"
    title="Case Converter"
    subtitle="Transform text instantly between common casing styles for code, titles, and filenames."
    :tool-id="toolId"
    placeholder="Type or paste text to convert it into a new case format..."
  >
    <template #toolbar>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="mode in caseModes"
            :key="mode.id"
            type="button"
            @click="selectedMode = mode.id"
            class="rounded-xl border px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="selectedMode === mode.id ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Converted output</p>
            <p class="text-sm text-slate-500">Preview the transformed text below.</p>
          </div>
        </div>
        <textarea
          :value="convertedText"
          rows="10"
          readonly
          class="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none resize-y min-h-55"
        />
      </div>
    </template>
  </TextToolWorkspace>
</template>
