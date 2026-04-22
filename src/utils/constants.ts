export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 5

// Conversion: 1cm in real life = CM_TO_PX pixels in the floor plan coordinate space
// PDF renders at 3500px wide; a typical venue is ~60m wide → 3500/6000 ≈ 0.58
export const CM_TO_PX = 0.55

// Seat display (in floor plan px)
export const SEAT_RADIUS = 8
export const SEAT_GAP = 12 // distance from table edge to seat center
