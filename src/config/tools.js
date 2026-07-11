export const toolCategories = [
  {
    id: 'image',
    label: 'Image',
    tools: [
      { label: 'Compressor', path: '/compress', routeName: 'compress' },
      { label: 'BG Remover', path: '/bg-remover', routeName: 'bg-remover' },
      { label: 'Upscaler', path: '/upscaler', routeName: 'upscaler' }
    ]
  },
  {
    id: 'files',
    label: 'Files',
    tools: [
      { label: 'PDF Merge', path: null, routeName: null, comingSoon: true },
      { label: 'File Converter', path: null, routeName: null, comingSoon: true }
    ]
  },
  {
    id: 'texts',
    label: 'Texts',
    tools: [
      { label: 'Word Counter', path: null, routeName: null, comingSoon: true },
      { label: 'Case Converter', path: null, routeName: null, comingSoon: true }
    ]
  }
]

export function categoryHasActiveTool(category, routeName) {
  return category.tools.some((tool) => tool.routeName === routeName)
}
