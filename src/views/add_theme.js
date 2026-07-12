const fs = require('fs');

let content = fs.readFileSync('CompressView.vue', 'utf8');

// Add theme import after the existing imports
content = content.replace(
  "} from '../utils/imageCompress.js'",
  "} from '../utils/imageCompress.js'\nimport { useTheme } from '../composables/useTheme.js'\n\nconst { isDark } = useTheme()"
);

fs.writeFileSync('CompressView.vue', content);

console.log('Done');
