import { ref, watch, onMounted } from 'vue'

const THEME_KEY = 'dashforge-theme'
const isDark = ref(true)

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (dark) => {
    isDark.value = dark
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  // Initialize theme from localStorage or default to dark
  onMounted(() => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme === 'light') {
      isDark.value = false
    } else if (savedTheme === 'dark') {
      isDark.value = true
    }
    applyTheme()
  })

  // Watch for theme changes and apply them
  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}
