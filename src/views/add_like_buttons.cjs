const fs = require('fs');

// Add like button to CompressView.vue
let content = fs.readFileSync('CompressView.vue', 'utf8');
content = content.replace(
  "const { isDark } = useTheme()",
  "const { isDark } = useTheme()\nimport { useLikedTools } from '../composables/useLikedTools.js'\n\nconst { isLiked, toggleLike } = useLikedTools()\nconst toolId = 'compress'"
);
content = content.replace(
  '<div class="text-center max-w-2xl mx-auto">',
  `<div class="text-center max-w-2xl mx-auto">
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
      </button>`
);
fs.writeFileSync('CompressView.vue', content);

// Add like button to BgRemover.vue
content = fs.readFileSync('BgRemover.vue', 'utf8');
content = content.replace(
  "const { isDark } = useTheme()",
  "const { isDark } = useTheme()\nimport { useLikedTools } from '../composables/useLikedTools.js'\n\nconst { isLiked, toggleLike } = useLikedTools()\nconst toolId = 'bg-remover'"
);
content = content.replace(
  '<div class="text-center max-w-2xl mx-auto">',
  `<div class="text-center max-w-2xl mx-auto relative">
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
      </button>`
);
fs.writeFileSync('BgRemover.vue', content);

// Add like button to UpscalerView.vue
content = fs.readFileSync('UpscalerView.vue', 'utf8');
content = content.replace(
  "const { isDark } = useTheme()",
  "const { isDark } = useTheme()\nimport { useLikedTools } from '../composables/useLikedTools.js'\n\nconst { isLiked, toggleLike } = useLikedTools()\nconst toolId = 'upscaler'"
);
content = content.replace(
  '<div class="text-center max-w-2xl mx-auto">',
  `<div class="text-center max-w-2xl mx-auto relative">
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
      </button>`
);
fs.writeFileSync('UpscalerView.vue', content);

console.log('Done adding like buttons to all tool pages');
