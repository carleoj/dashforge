import re

with open('CompressView.vue', 'r') as f:
    content = f.read()

# Add theme import after the existing imports
content = content.replace(
    "} from '../utils/imageCompress.js'",
    "} from '../utils/imageCompress.js'\nimport { useTheme } from '../composables/useTheme.js'\n\nconst { isDark } = useTheme()"
)

with open('CompressView.vue', 'w') as f:
    f.write(content)

print('Done')
