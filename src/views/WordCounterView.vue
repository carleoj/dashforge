<script setup>
import { computed, ref } from 'vue'
import TextToolWorkspace from '../components/TextToolWorkspace.vue'
import { useTheme } from '../composables/useTheme.js'

const { isDark } = useTheme()

const text = ref('')
const toolId = 'word-counter'

const stats = computed(() => {
  const value = text.value || ''

  return {
    words: value.match(/\S+/g)?.length ?? 0,
    chars: value.length,
    charsNoSpaces: value.replace(/\s/g, '').length,
    lines: value === '' ? 0 : value.split(/\r?\n/).length
  }
})
</script>

<template>
  <TextToolWorkspace
    v-model="text"
    title="Word Counter"
    subtitle="Paste text, upload a document, and instantly see counts for words, characters, and lines."
    :tool-id="toolId"
    placeholder="Type or paste text to count words, characters, and lines..."
  >
    <template #toolbar>
      <div class="rounded-2xl border border-slate-300 bg-slate-100 p-4 shadow-sm">
        <div class="flex flex-wrap gap-3">
          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Words
            </p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">
              {{ stats.words }}
            </p>
          </div>

          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Characters
            </p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">
              {{ stats.chars }}
            </p>
          </div>

          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              No Spaces
            </p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">
              {{ stats.charsNoSpaces }}
            </p>
          </div>

          <div class="min-w-35 rounded-xl border border-slate-300 bg-slate-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Lines
            </p>
            <p class="mt-1 text-2xl font-semibold text-slate-800">
              {{ stats.lines }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </TextToolWorkspace>
</template>