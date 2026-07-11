import { removeBackground } from '@imgly/background-removal'

const MODEL_MAP = {
  fast: 'isnet_quint8',
  balanced: 'isnet_fp16',
  quality: 'isnet'
}

export async function removeImageBackground(file, { model = 'balanced', onProgress } = {}) {
  return removeBackground(file, {
    model: MODEL_MAP[model] ?? MODEL_MAP.balanced,
    output: {
      format: 'image/png',
      quality: 1
    },
    progress: onProgress
      ? (stage, current, total) => onProgress({ stage, current, total, percent: total ? Math.round((current / total) * 100) : 0 })
      : undefined
  })
}
