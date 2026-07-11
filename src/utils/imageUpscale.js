const SHARPEN_KERNEL = [
  0, -1, 0,
  -1, 5, -1,
  0, -1, 0
]

function applySharpen(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data, width: w, height: h } = imageData
  const copy = new Uint8ClampedArray(data)

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0
        let kernelIndex = 0

        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const pixelIndex = ((y + ky) * w + (x + kx)) * 4 + channel
            sum += copy[pixelIndex] * SHARPEN_KERNEL[kernelIndex]
            kernelIndex += 1
          }
        }

        const currentIndex = (y * w + x) * 4 + channel
        data[currentIndex] = Math.min(255, Math.max(0, sum))
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function upscaleImage(file, { scale = 2, sharpen = true, format = 'image/png', quality = 0.92 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const width = Math.round(img.naturalWidth * scale)
      const height = Math.round(img.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not initialize canvas'))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      if (sharpen) applySharpen(ctx, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Upscale failed'))
            return
          }
          resolve({
            blob,
            width,
            height,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight
          })
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}
