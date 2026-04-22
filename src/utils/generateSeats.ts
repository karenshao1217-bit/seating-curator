import { CM_TO_PX, SEAT_GAP } from './constants'

export interface SeatPosition {
  label: string
  relX: number
  relY: number
}

type TableShape = 'round' | 'rect' | 'long'

/** Get the display size in floor-plan pixels based on actual cm dimensions */
export function getTableDisplaySize(
  shape: TableShape,
  widthCm: number,
  heightCm: number
): { w: number; h: number } {
  const w = widthCm * CM_TO_PX
  const h = (shape === 'round' ? widthCm : heightCm) * CM_TO_PX
  return { w: Math.round(w), h: Math.round(h) }
}

export function generateSeats(
  shape: TableShape,
  widthCm: number,
  heightCm: number,
  capacity: number,
  tableLabel: string
): SeatPosition[] {
  const { w, h } = getTableDisplaySize(shape, widthCm, heightCm)

  switch (shape) {
    case 'round':
      return generateRoundSeats(w, capacity, tableLabel)
    case 'rect':
      return generateRectSeats(w, h, capacity, tableLabel)
    case 'long':
      return generateLongSeats(w, h, capacity, tableLabel)
  }
}

function generateRoundSeats(
  diameter: number,
  capacity: number,
  tableLabel: string
): SeatPosition[] {
  const seatDist = diameter / 2 + SEAT_GAP
  const seats: SeatPosition[] = []

  for (let i = 0; i < capacity; i++) {
    const angle = (2 * Math.PI * i) / capacity - Math.PI / 2
    seats.push({
      label: `${tableLabel}-${i + 1}`,
      relX: Math.round(Math.cos(angle) * seatDist),
      relY: Math.round(Math.sin(angle) * seatDist),
    })
  }
  return seats
}

function generateRectSeats(
  w: number,
  h: number,
  capacity: number,
  tableLabel: string
): SeatPosition[] {
  const perSide = Math.ceil(capacity / 4)
  const seats: SeatPosition[] = []
  let idx = 0

  // Top
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const x = -w / 2 + (w / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(x), relY: Math.round(-h / 2 - SEAT_GAP) })
  }
  // Right
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const y = -h / 2 + (h / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(w / 2 + SEAT_GAP), relY: Math.round(y) })
  }
  // Bottom
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const x = w / 2 - (w / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(x), relY: Math.round(h / 2 + SEAT_GAP) })
  }
  // Left
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const y = h / 2 - (h / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(-w / 2 - SEAT_GAP), relY: Math.round(y) })
  }

  return seats
}

function generateLongSeats(
  w: number,
  h: number,
  capacity: number,
  tableLabel: string
): SeatPosition[] {
  const perSide = Math.ceil(capacity / 2)
  const seats: SeatPosition[] = []
  let idx = 0

  // Top long side
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const x = -w / 2 + (w / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(x), relY: Math.round(-h / 2 - SEAT_GAP) })
  }
  // Bottom long side
  for (let i = 0; i < perSide && idx < capacity; i++, idx++) {
    const x = -w / 2 + (w / (perSide + 1)) * (i + 1)
    seats.push({ label: `${tableLabel}-${idx + 1}`, relX: Math.round(x), relY: Math.round(h / 2 + SEAT_GAP) })
  }

  return seats
}
