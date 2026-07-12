const fs = require('fs');

// Fix BgRemover.vue
let content = fs.readFileSync('BgRemover.vue', 'utf8');
content = content.replace(
  "import { removeImageBackground } from '../utils/backgroundRemoval.js'",
  "import { removeImageBackground } from '../utils/backgroundRemoval.js'\nimport { useTheme } from '../composables/useTheme.js'\n\nconst { isDark } = useTheme()"
);
content = content.replace(
  '<h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">',
  '<h1 class="text-3xl sm:text-4xl font-bold tracking-tight transition-colors" :class="isDark ? \'text-slate-900\' : \'text-[#1a1a1a]\'">'
);
content = content.replace(
  '<p class="mt-3 text-slate-500 text-base sm:text-lg">',
  '<p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? \'text-slate-500\' : \'text-[var(--text-secondary)]\'">'
);
fs.writeFileSync('BgRemover.vue', content);

// Fix CompressView.vue
content = fs.readFileSync('CompressView.vue', 'utf8');
content = content.replace(
  "} from '../utils/imageCompress.js'",
  "} from '../utils/imageCompress.js'\nimport { useTheme } from '../composables/useTheme.js'\n\nconst { isDark } = useTheme()"
);
content = content.replace(
  '<h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">',
  '<h1 class="text-3xl sm:text-4xl font-bold tracking-tight transition-colors" :class="isDark ? \'text-slate-900\' : \'text-[#1a1a1a]\'">'
);
content = content.replace(
  '<p class="mt-3 text-slate-500 text-base sm:text-lg">',
  '<p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? \'text-slate-500\' : \'text-[var(--text-secondary)]\'">'
);
fs.writeFileSync('CompressView.vue', content);

// Fix UpscalerView.vue
content = fs.readFileSync('UpscalerView.vue', 'utf8');
content = content.replace(
  "import { upscaleImage } from '../utils/imageUpscale.js'",
  "import { upscaleImage } from '../utils/imageUpscale.js'\nimport { useTheme } from '../composables/useTheme.js'\n\nconst { isDark } = useTheme()"
);
content = content.replace(
  '<h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">',
  '<h1 class="text-3xl sm:text-4xl font-bold tracking-tight transition-colors" :class="isDark ? \'text-slate-900\' : \'text-[#1a1a1a]\'">'
);
content = content.replace(
  '<p class="mt-3 text-slate-500 text-base sm:text-lg">',
  '<p class="mt-3 text-base sm:text-lg transition-colors" :class="isDark ? \'text-slate-500\' : \'text-[var(--text-secondary)]\'">'
);
fs.writeFileSync('UpscalerView.vue', content);

console.log('Done fixing all view files');
