/*
 * useGuests — Firestore CRUD for events/{eventId}/guests
 *
 * Key responsibilities beyond basic CRUD:
 *   1. Bidirectional sync for avoidGuestIds and mustSameTableGuestIds
 *      — if A avoids B, both docs store the symmetric reference.
 *   2. Cascade cleanup on delete — remove deleted guest's id from every
 *      other guest's avoid/must lists.
 *   3. Compute default displayName on create (via formatName).
 *
 * All multi-doc mutations use writeBatch for atomicity.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Guest, GuestInput, GuestUpdate } from '../types/guest'
import { computeDefaultDisplayName } from '../utils/formatName'

function guestsPath(eventId: string) {
  return `events/${eventId}/guests`
}

function nowUser() {
  return auth.currentUser?.uid ?? 'anonymous'
}

export function useGuests(eventId: string | undefined) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    const unsub = onSnapshot(collection(db, guestsPath(eventId)), (snap) => {
      const list: Guest[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name ?? '',
          displayName: data.displayName,
          honorific: data.honorific,
          company: data.company,
          unit: data.unit,
          title: data.title,
          groupId: data.groupId ?? null,
          isVIP: data.isVIP ?? false,
          tags: data.tags ?? [],
          avoidGuestIds: data.avoidGuestIds ?? [],
          mustSameTableGuestIds: data.mustSameTableGuestIds ?? [],
          noteChips: data.noteChips ?? [],
          meal: data.meal ?? {},
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        }
      })
      setGuests(list)
      setLoading(false)
    })
    return unsub
  }, [eventId])

  /** Add a new guest. Computes displayName if not provided. */
  const addGuest = useCallback(
    async (input: GuestInput): Promise<string> => {
      if (!eventId) throw new Error('No eventId')
      const ref = doc(collection(db, guestsPath(eventId)))

      const displayName =
        input.displayName ?? computeDefaultDisplayName(input.name)

      const batch = writeBatch(db)
      batch.set(ref, {
        name: input.name,
        displayName,
        honorific: input.honorific ?? null,
        company: input.company ?? '',
        unit: input.unit ?? '',
        title: input.title ?? '',
        groupId: input.groupId ?? null,
        isVIP: input.isVIP ?? false,
        tags: input.tags ?? [],
        avoidGuestIds: input.avoidGuestIds ?? [],
        mustSameTableGuestIds: input.mustSameTableGuestIds ?? [],
        noteChips: input.noteChips ?? [],
        meal: input.meal ?? {},
        createdAt: serverTimestamp(),
        createdBy: nowUser(),
        updatedAt: serverTimestamp(),
        updatedBy: nowUser(),
      })

      // Bidirectional sync on create (rare, but if input pre-fills avoid/must)
      for (const otherId of input.avoidGuestIds ?? []) {
        batch.update(doc(db, guestsPath(eventId), otherId), {
          avoidGuestIds: arrayUnion(ref.id),
          updatedAt: serverTimestamp(),
          updatedBy: nowUser(),
        })
      }
      for (const otherId of input.mustSameTableGuestIds ?? []) {
        batch.update(doc(db, guestsPath(eventId), otherId), {
          mustSameTableGuestIds: arrayUnion(ref.id),
          updatedAt: serverTimestamp(),
          updatedBy: nowUser(),
        })
      }

      await batch.commit()
      return ref.id
    },
    [eventId]
  )

  /**
   * Update a guest. If avoidGuestIds or mustSameTableGuestIds differ from
   * the existing doc, sync the symmetric references on the other guests.
   */
  const updateGuest = useCallback(
    async (guestId: string, updates: GuestUpdate): Promise<void> => {
      if (!eventId) throw new Error('No eventId')

      const current = guests.find((g) => g.id === guestId)
      if (!current) throw new Error(`Guest ${guestId} not found`)

      const batch = writeBatch(db)
      const selfRef = doc(db, guestsPath(eventId), guestId)

      // Recompute displayName if name changed and caller didn't specify
      const next = { ...updates }
      if (
        updates.name !== undefined &&
        updates.name !== current.name &&
        updates.displayName === undefined
      ) {
        next.displayName = computeDefaultDisplayName(updates.name)
      }

      batch.update(selfRef, {
        ...next,
        updatedAt: serverTimestamp(),
        updatedBy: nowUser(),
      })

      // --- Bidirectional sync: avoidGuestIds ---
      if (updates.avoidGuestIds !== undefined) {
        const prev = new Set(current.avoidGuestIds)
        const now = new Set(updates.avoidGuestIds)
        const added = [...now].filter((id) => !prev.has(id))
        const removed = [...prev].filter((id) => !now.has(id))
        for (const otherId of added) {
          batch.update(doc(db, guestsPath(eventId), otherId), {
            avoidGuestIds: arrayUnion(guestId),
            updatedAt: serverTimestamp(),
            updatedBy: nowUser(),
          })
        }
        for (const otherId of removed) {
          batch.update(doc(db, guestsPath(eventId), otherId), {
            avoidGuestIds: arrayRemove(guestId),
            updatedAt: serverTimestamp(),
            updatedBy: nowUser(),
          })
        }
      }

      // --- Bidirectional sync: mustSameTableGuestIds ---
      if (updates.mustSameTableGuestIds !== undefined) {
        const prev = new Set(current.mustSameTableGuestIds)
        const now = new Set(updates.mustSameTableGuestIds)
        const added = [...now].filter((id) => !prev.has(id))
        const removed = [...prev].filter((id) => !now.has(id))
        for (const otherId of added) {
          batch.update(doc(db, guestsPath(eventId), otherId), {
            mustSameTableGuestIds: arrayUnion(guestId),
            updatedAt: serverTimestamp(),
            updatedBy: nowUser(),
          })
        }
        for (const otherId of removed) {
          batch.update(doc(db, guestsPath(eventId), otherId), {
            mustSameTableGuestIds: arrayRemove(guestId),
            updatedAt: serverTimestamp(),
            updatedBy: nowUser(),
          })
        }
      }

      await batch.commit()
    },
    [eventId, guests]
  )

  /**
   * Delete a guest and cascade-clean all references from other guests'
   * avoidGuestIds and mustSameTableGuestIds.
   */
  const deleteGuest = useCallback(
    async (guestId: string): Promise<void> => {
      if (!eventId) throw new Error('No eventId')

      const batch = writeBatch(db)

      // Remove this id from every other guest that references it
      for (const other of guests) {
        if (other.id === guestId) continue
        const refsAvoid = other.avoidGuestIds.includes(guestId)
        const refsMust = other.mustSameTableGuestIds.includes(guestId)
        if (refsAvoid || refsMust) {
          const patch: Record<string, unknown> = {
            updatedAt: serverTimestamp(),
            updatedBy: nowUser(),
          }
          if (refsAvoid) patch.avoidGuestIds = arrayRemove(guestId)
          if (refsMust) patch.mustSameTableGuestIds = arrayRemove(guestId)
          batch.update(doc(db, guestsPath(eventId), other.id), patch)
        }
      }

      // Delete the guest itself
      batch.delete(doc(db, guestsPath(eventId), guestId))
      await batch.commit()
    },
    [eventId, guests]
  )

  return { guests, loading, addGuest, updateGuest, deleteGuest }
}
