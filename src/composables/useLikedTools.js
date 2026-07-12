import { ref, watch, onMounted } from 'vue'

const LIKED_TOOLS_KEY = 'dashforge-liked-tools'
const likedTools = ref(new Set())

export function useLikedTools() {
  const toggleLike = (toolId) => {
    if (likedTools.value.has(toolId)) {
      likedTools.value.delete(toolId)
    } else {
      likedTools.value.add(toolId)
    }
    saveLikedTools()
  }

  const isLiked = (toolId) => {
    return likedTools.value.has(toolId)
  }

  const saveLikedTools = () => {
    localStorage.setItem(LIKED_TOOLS_KEY, JSON.stringify([...likedTools.value]))
  }

  const loadLikedTools = () => {
    const saved = localStorage.getItem(LIKED_TOOLS_KEY)
    if (saved) {
      try {
        likedTools.value = new Set(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load liked tools:', e)
        likedTools.value = new Set()
      }
    }
  }

  onMounted(() => {
    loadLikedTools()
  })

  return {
    likedTools,
    toggleLike,
    isLiked
  }
}
