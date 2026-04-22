import { Group, Circle, Rect, Text } from 'react-konva'
import { getTableDisplaySize } from '../../utils/generateSeats'
import type { TableData } from '../../hooks/useTables'
import SeatDot from './SeatDot'

interface Props {
  table: TableData
  isSelected: boolean
  onSelect: (tableId: string) => void
  onDragEnd: (tableId: string, x: number, y: number) => void
}

export default function TableGroup({ table, isSelected, onSelect, onDragEnd }: Props) {
  const { w, h } = getTableDisplaySize(table.shape, table.widthCm, table.heightCm)

  const handleDragEnd = (e: import('konva/lib/Node').KonvaEventObject<DragEvent>) => {
    onDragEnd(table.id, Math.round(e.target.x()), Math.round(e.target.y()))
  }

  const handleClick = (e: import('konva/lib/Node').KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    onSelect(table.id)
  }

  // Scale font size relative to table size (min 8, max 16)
  const fontSize = Math.max(8, Math.min(16, Math.round(w * 0.15)))

  return (
    <Group
      x={table.x}
      y={table.y}
      rotation={table.rotation}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection border */}
      {isSelected && table.shape === 'round' && (
        <Circle
          radius={w / 2 + 4}
          stroke="#333"
          strokeWidth={1}
          dash={[4, 3]}
          fill="transparent"
        />
      )}
      {isSelected && table.shape !== 'round' && (
        <Rect
          x={-w / 2 - 4}
          y={-h / 2 - 4}
          width={w + 8}
          height={h + 8}
          stroke="#333"
          strokeWidth={1}
          dash={[4, 3]}
          fill="transparent"
          cornerRadius={2}
        />
      )}

      {/* Table shape */}
      {table.shape === 'round' ? (
        <Circle
          radius={w / 2}
          fill="#E8E8E8"
          stroke="#AAAAAA"
          strokeWidth={1}
        />
      ) : (
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="#E8E8E8"
          stroke="#AAAAAA"
          strokeWidth={1}
          cornerRadius={table.shape === 'long' ? 2 : 1}
        />
      )}

      {/* Table label — centered at (0,0) */}
      <Text
        text={table.label}
        fontSize={fontSize}
        fill="#333333"
        fontStyle="bold"
        width={w}
        height={h}
        offsetX={w / 2}
        offsetY={h / 2}
        align="center"
        verticalAlign="middle"
      />

      {/* Seats */}
      {table.seats.map((seat) => (
        <SeatDot key={seat.id} seat={seat} />
      ))}
    </Group>
  )
}
