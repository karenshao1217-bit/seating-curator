import { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'

interface Props {
  imageUrl: string
  onLoad?: (width: number, height: number) => void
}

export default function BackgroundImage({ imageUrl, onLoad }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      setImage(img)
      onLoad?.(img.naturalWidth, img.naturalHeight)
    }
    img.onerror = () => console.error('[BackgroundImage] Failed to load:', imageUrl)
    img.src = imageUrl
    return () => {
      img.onload = null
    }
  }, [imageUrl, onLoad])

  if (!image) return null

  // Render at natural pixel size — stage zoom handles display scaling
  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={image.naturalWidth}
      height={image.naturalHeight}
      listening={false}
    />
  )
}
