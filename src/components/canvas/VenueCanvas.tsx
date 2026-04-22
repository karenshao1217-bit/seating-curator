import { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { ZOOM_MIN, ZOOM_MAX } from '../../utils/constants'
import type { TableData } from '../../hooks/useTables'
import TableGroup from './TableGroup'
import BackgroundImage from './BackgroundImage'
import styles from './VenueCanvas.module.css'

interface Props {
  tables: TableData[]
  selectedTableId: string | null
  onSelectTable: (id: string | null) => void
  onDragEnd: (tableId: string, x: number, y: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  venueImageUrl?: string
}

export default function VenueCanvas({
  tables,
  selectedTableId,
  onSelectTable,
  onDragEnd,
  containerRef,
  venueImageUrl,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const lastDist = useRef(0)
  const initialFitDone = useRef(false)

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  // When background image loads, fit stage to show the full image
  const handleImageLoad = useCallback(
    (imgWidth: number, imgHeight: number) => {
      if (initialFitDone.current) return
      initialFitDone.current = true

      const stage = stageRef.current
      if (!stage) return

      const padding = 20
      const scaleX = (size.width - padding * 2) / imgWidth
      const scaleY = (size.height - padding * 2) / imgHeight
      const fitScale = Math.min(scaleX, scaleY, 1)

      stage.scale({ x: fitScale, y: fitScale })
      stage.position({
        x: (size.width - imgWidth * fitScale) / 2,
        y: (size.height - imgHeight * fitScale) / 2,
      })
      setScale(fitScale)
    },
    [size]
  )

  // Wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const direction = e.evt.deltaY > 0 ? -1 : 1
    const factor = 1.08
    let newScale = direction > 0 ? oldScale * factor : oldScale / factor
    newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale))

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    stage.scale({ x: newScale, y: newScale })
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
    setScale(newScale)
  }, [])

  // Touch pinch zoom
  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches
    if (touches.length !== 2) return
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (lastDist.current === 0) {
      lastDist.current = dist
      return
    }

    const oldScale = stage.scaleX()
    let newScale = oldScale * (dist / lastDist.current)
    newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale))

    const center = {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    }

    stage.scale({ x: newScale, y: newScale })
    stage.position({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    })
    setScale(newScale)
    lastDist.current = dist
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastDist.current = 0
  }, [])

  // Click empty area to deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === stageRef.current) {
        onSelectTable(null)
      }
    },
    [onSelectTable]
  )

  return (
    <div className={styles.wrapper}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        draggable
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleStageClick}
        onTap={handleStageClick}
        scaleX={scale}
        scaleY={scale}
      >
        {/* Background layer */}
        <Layer>
          {venueImageUrl && (
            <BackgroundImage
              imageUrl={venueImageUrl}
              onLoad={handleImageLoad}
            />
          )}
        </Layer>

        {/* Tables layer */}
        <Layer>
          {tables.map((table) => (
            <TableGroup
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onSelect={onSelectTable}
              onDragEnd={onDragEnd}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
