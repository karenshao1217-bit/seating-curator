/*
 * sortGuests — pure utility for ordering the guest list.
 *
 * Phase 4 only exposes 'created_desc' in UI, but supports all three here
 * so future sort toggles plug in without data-layer changes.
 */

import type { Guest } from '../types/guest'

export type GuestSortBy = 'created_desc' | 'name' | 'group'

export function sortGuests(
  guests: Guest[],
  sortBy: GuestSortBy,
  groupOrder?: string[]
): Guest[] {
  const copy = [...guests]

  switch (sortBy) {
    case 'created_desc':
      return copy.sort((a, b) => {
        const aMs =
          a.createdAt && typeof (a.createdAt as { toMillis?: () => number }).toMillis === 'function'
            ? (a.createdAt as { toMillis: () => number }).toMillis()
            : 0
        const bMs =
          b.createdAt && typeof (b.createdAt as { toMillis?: () => number }).toMillis === 'function'
            ? (b.createdAt as { toMillis: () => number }).toMillis()
            : 0
        return bMs - aMs
      })

    case 'name':
      return copy.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'zh-Hant')
      )

    case 'group': {
      // Sort by group order first, ungrouped last; within group by name
      const order = new Map<string, number>()
      ;(groupOrder ?? []).forEach((id, i) => order.set(id, i))
      return copy.sort((a, b) => {
        const aIdx =
          a.groupId && order.has(a.groupId)
            ? order.get(a.groupId)!
            : Number.MAX_SAFE_INTEGER
        const bIdx =
          b.groupId && order.has(b.groupId)
            ? order.get(b.groupId)!
            : Number.MAX_SAFE_INTEGER
        if (aIdx !== bIdx) return aIdx - bIdx
        return (a.name || '').localeCompare(b.name || '', 'zh-Hant')
      })
    }
  }
}
