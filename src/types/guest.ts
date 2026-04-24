/*
 * Guest & Group type definitions.
 * Firestore paths:
 *   events/{eventId}/guests/{guestId}
 *   events/{eventId}/groups/{groupId}
 */

import type { Timestamp } from 'firebase/firestore'

export type Honorific =
  | 'Mr.'
  | 'Mrs.'
  | 'Ms.'
  | 'Miss'
  | 'Dr.'
  | 'Prof.'
  | 'Rev.'
  | 'Sir'
  | 'Lord'
  | 'Lady'
  | 'Hon.'
  | 'Capt.'
  | 'Col.'
  | 'Gen.'
  | (string & {}) // allow custom values (e.g. 董事長, 總裁)

export type NoteChipType = 'avoid' | 'must' | 'social' | 'timing'

export interface NoteChip {
  type: NoteChipType
  text: string
}

export interface MealInfo {
  type?: string
  restrictions?: string[]
  notes?: string
}

export interface Guest {
  // Firestore doc id (not persisted in the doc fields)
  id: string

  // Basic
  name: string
  displayName?: string // override for seat-label abbreviated form
  honorific?: Honorific
  company?: string
  unit?: string
  title?: string

  // Groups & flags
  groupId?: string | null
  isVIP?: boolean
  tags: string[]

  // Phase 5 seating constraints (Phase 4 stores, Phase 5 enforces)
  avoidGuestIds: string[]
  mustSameTableGuestIds: string[]
  noteChips: NoteChip[]

  // Meal
  meal: MealInfo

  // System
  createdAt?: Timestamp
  createdBy?: string
  updatedAt?: Timestamp
  updatedBy?: string
}

/** Input shape for creating a guest — system fields filled by the hook. */
export type GuestInput = Omit<
  Guest,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>

/** Partial update shape. */
export type GuestUpdate = Partial<
  Omit<Guest, 'id' | 'createdAt' | 'createdBy'>
>

// ---------- Group ----------

export type GroupRule = 'same_table' | 'close_tables' | 'none'

export interface Group {
  id: string
  name: string
  color: string // hex like "#8a6b2e" or token name
  rule?: GroupRule // default 'none'
  createdAt?: Timestamp
  createdBy?: string
}

export type GroupInput = Omit<Group, 'id' | 'createdAt' | 'createdBy'>
export type GroupUpdate = Partial<Omit<Group, 'id' | 'createdAt' | 'createdBy'>>
