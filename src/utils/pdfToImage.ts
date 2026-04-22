import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const RENDER_WIDTH = 3500
const THUMBNAIL_WIDTH = 180

async function loadPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await loadPdf(file)
  return pdf.numPages
}

export async function renderPdfPage(
  file: File,
  pageNum: number
): Promise<{ blob: Blob; width: number; height: number }> {
  const pdf = await loadPdf(file)
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  const scale = RENDER_WIDTH / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height
  const ctx = canvas.getContext('2d')!

  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    )
  })

  return {
    blob,
    width: Math.round(scaledViewport.width),
    height: Math.round(scaledViewport.height),
  }
}

export async function renderPdfThumbnail(
  file: File,
  pageNum: number
): Promise<string> {
  const pdf = await loadPdf(file)
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  const scale = THUMBNAIL_WIDTH / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height
  const ctx = canvas.getContext('2d')!

  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise

  return canvas.toDataURL('image/png')
}
