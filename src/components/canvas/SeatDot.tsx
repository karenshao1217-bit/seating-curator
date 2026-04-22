import { Circle, Group, Label, Tag, Text } from 'react-konva'
import { useState } from 'react'
import { SEAT_RADIUS } from '../../utils/constants'
import type { SeatData } from '../../hooks/useTables'

interface Props {
  seat: SeatData
}

export default function SeatDot({ seat }: Props) {
  const [hovered, setHovered] = useState(false)
  const assigned = !!seat.guestId

  return (
    <Group x={seat.relX} y={seat.relY}>
      <Circle
        radius={SEAT_RADIUS}
        fill={assigned ? '#555' : 'transparent'}
        stroke="#999"
        strokeWidth={1}
        onMouseEnter={(e) => {
          setHovered(true)
          const container = e.target.getStage()?.container()
          if (container) container.style.cursor = 'pointer'
        }}
        onMouseLeave={(e) => {
          setHovered(false)
          const container = e.target.getStage()?.container()
          if (container) container.style.cursor = 'default'
        }}
      />
      {hovered && (
        <Label x={0} y={-SEAT_RADIUS - 8} offsetX={0}>
          <Tag
            fill="rgba(0,0,0,0.75)"
            cornerRadius={4}
            pointerDirection="down"
            pointerWidth={8}
            pointerHeight={4}
          />
          <Text
            text={seat.label}
            fontSize={11}
            fill="#fff"
            padding={4}
            align="center"
          />
        </Label>
      )}
    </Group>
  )
}
