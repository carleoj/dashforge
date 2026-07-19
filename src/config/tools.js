export const toolCategories = [
  {
    id: 'image',
    label: 'Image',
    tools: [
      { id: 'compress', label: 'Compressor', path: '/compress', routeName: 'compress' },
      { id: 'bg-remover', label: 'BG Remover', path: '/bg-remover', routeName: 'bg-remover' },
      { id: 'upscaler', label: 'Upscaler', path: '/upscaler', routeName: 'upscaler' }
    ]
  },
  {
    id: 'files',
    label: 'Files',
    tools: [
      { id: 'text-extractor', label: 'Text Extractor', path: '/text-extractor', routeName: 'text-extractor' },
      { id: 'pdf-compressor', label: 'PDF Compressor', path: '/pdf-compressor', routeName: 'pdf-compressor' },
      { id: 'pdf-merge', label: 'PDF Merge', path: null, routeName: null, comingSoon: true }
    ]
  },
  {
    id: 'texts',
    label: 'Texts',
    tools: [
      { id: 'word-counter', label: 'Word Counter', path: '/word-counter', routeName: 'word-counter' },
      { id: 'case-converter', label: 'Case Converter', path: '/case-converter', routeName: 'case-converter' }
    ]
  }
]

export function categoryHasActiveTool(category, routeName) {
  return category.tools.some((tool) => tool.routeName === routeName)
}
