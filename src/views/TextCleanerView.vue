<script setup>
import { computed, ref } from 'vue'
import TextToolWorkspace from '../components/TextToolWorkspace.vue'

const text = ref('')
const toolId = 'text-cleaner'

const cleaningOptions = ref({
  removeDuplicateWords: true,
  removeExtraSpaces: true,
  removeEmojis: false,
  trimLines: true,
  removeEmptyLines: false,
  normalizeQuotes: false
})

const optionList = [
  {
    key: 'removeDuplicateWords',
    label: 'Remove duplicate words',
    description: 'Collapses repeated neighboring words like "the the" into one.'
  },
  {
    key: 'removeExtraSpaces',
    label: 'Remove extra spaces',
    description: 'Turns repeated spaces and tabs into cleaner single spacing.'
  },
  {
    key: 'removeEmojis',
    label: 'Remove emojis',
    description: 'Strips emoji characters from the output text.'
  },
  {
    key: 'trimLines',
    label: 'Trim each line',
    description: 'Removes leading and trailing whitespace on every line.'
  },
  {
    key: 'removeEmptyLines',
    label: 'Remove empty lines',
    description: 'Deletes blank lines to make blocks of text more compact.'
  },
  {
    key: 'normalizeQuotes',
    label: 'Normalize smart quotes',
    description: 'Converts curly quotes and apostrophes into plain ASCII characters.'
  }
]

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeLineBreaks = (value) => value.replace(/\r\n/g, '\n')

const cleanText = (value) => {
  let result = normalizeLineBreaks(value || '')

  if (!result) return ''

  if (cleaningOptions.value.normalizeQuotes) {
    result = result
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
  }

  if (cleaningOptions.value.removeEmojis) {
    result = result.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
    result = result.replace(/[\u200D\uFE0F]/g, '')
  }

  if (cleaningOptions.value.trimLines) {
    result = result
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
  }

  if (cleaningOptions.value.removeExtraSpaces) {
    result = result
      .split('\n')
      .map((line) => line.replace(/[^\S\n]+/g, ' ').trimEnd())
      .join('\n')
  }

  if (cleaningOptions.value.removeDuplicateWords) {
    const duplicatePattern = /\b([\p{L}\p{N}]+)\b/giu
    result = result
      .split('\n')
      .map((line) => {
        let cleanedLine = line
        const words = [...line.matchAll(duplicatePattern)]

        for (let index = 0; index < words.length - 1; index += 1) {
          const currentMatch = words[index]
          const nextMatch = words[index + 1]
          const currentWord = currentMatch[0]
          const nextWord = nextMatch[0]

          if (currentWord.toLowerCase() !== nextWord.toLowerCase()) continue

          const betweenText = line.slice(currentMatch.index + currentWord.length, nextMatch.index)
          if (!/^[\s.,!?;:'"()\-]+$/.test(betweenText)) continue

          const removalTarget = `${betweenText}${nextWord}`
          cleanedLine = cleanedLine.replace(new RegExp(escapeRegExp(removalTarget)), '')
        }

        return cleanedLine
      })
      .join('\n')
  }

  if (cleaningOptions.value.removeEmptyLines) {
    result = result
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')
  }

  return result.trim()
}

const cleanedText = computed(() => cleanText(text.value))

const stats = computed(() => ({
  originalChars: text.value.length,
  cleanedChars: cleanedText.value.length,
  originalWords: text.value.match(/\S+/g)?.length ?? 0,
  cleanedWords: cleanedText.value.match(/\S+/g)?.length ?? 0
}))
</script>

<template>
  <TextToolWorkspace
    v-model="text"
    title="Text Cleaner"
    subtitle="Tidy messy text with quick cleanup options, then copy the cleaned output."
    :tool-id="toolId"
    placeholder="Paste text with duplicates, extra spaces, emojis, or messy formatting..."
  >
    <template #toolbar>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cleaning options</p>
          <p class="mt-1 text-sm text-slate-500">Toggle the fixes you want to apply to the input text.</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="option in optionList"
            :key="option.key"
            type="button"
            @click="cleaningOptions[option.key] = !cleaningOptions[option.key]"
            class="rounded-2xl border p-4 text-left transition-colors cursor-pointer"
            :class="cleaningOptions[option.key]
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-slate-200 bg-slate-50 hover:bg-white'"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold" :class="cleaningOptions[option.key] ? 'text-indigo-700' : 'text-slate-700'">
                  {{ option.label }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ option.description }}
                </p>
              </div>
              <span
                class="mt-0.5 inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors"
                :class="cleaningOptions[option.key] ? 'bg-indigo-500' : 'bg-slate-300'"
              >
                <span
                  class="h-4 w-4 rounded-full bg-white transition-transform"
                  :class="cleaningOptions[option.key] ? 'translate-x-5' : 'translate-x-0'"
                />
              </span>
            </div>
          </button>
        </div>

        <div class="flex flex-wrap gap-3">
          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Original chars</p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.originalChars }}</p>
          </div>
          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cleaned chars</p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.cleanedChars }}</p>
          </div>
          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Original words</p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.originalWords }}</p>
          </div>
          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cleaned words</p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.cleanedWords }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cleaned output</p>
            <p class="text-sm text-slate-500">This updates live based on the selected cleaning options.</p>
          </div>
        </div>
        <textarea
          :value="cleanedText"
          rows="10"
          readonly
          class="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none resize-y min-h-55"
        />
      </div>
    </template>
  </TextToolWorkspace>
</template>
