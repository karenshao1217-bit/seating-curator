/*
 * useGroups — Firestore CRUD for events/{eventId}/groups
 *
 * Groups are a lightweight subcollection of the event. On delete, we also
 * clear the `groupId` on all guests that reference this group (cascade).
 */

import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  getDocs,
  orderBy,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Group, GroupInput, GroupUpdate } from '../types/guest'

function groupsPath(eventId: string) {
  return `events/${eventId}/groups`
}

function guestsPath(eventId: string) {
  return `events/${eventId}/guests`
}

function nowUser() {
  return auth.currentUser?.uid ?? 'anonymous'
}

export function useGroups(eventId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    const q = query(collection(db, groupsPath(eventId)), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const list: Group[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name ?? '',
          color: data.color ?? '#8a8f9a',
          rule: data.rule ?? 'none',
          createdAt: data.createdAt,
          createdBy: data.createdBy,
        }
      })
      setGroups(list)
      setLoading(false)
    })
    return unsub
  }, [eventId])

  const addGroup = useCallback(
    async (input: GroupInput): Promise<string> => {
      if (!eventId) throw new Error('No eventId')
      const ref = doc(collection(db, groupsPath(eventId)))
      const batch = writeBatch(db)
      batch.set(ref, {
        name: input.name,
        color: input.color,
        rule: input.rule ?? 'none',
        createdAt: serverTimestamp(),
        createdBy: nowUser(),
      })
      await batch.commit()
      return ref.id
    },
    [eventId]
  )

  const updateGroup = useCallback(
    async (groupId: string, updates: GroupUpdate): Promise<void> => {
      if (!eventId) throw new Error('No eventId')
      const batch = writeBatch(db)
      batch.update(doc(db, groupsPath(eventId), groupId), updates)
      await batch.commit()
    },
    [eventId]
  )

  /**
   * Delete a group and clear groupId from all guests that reference it.
   */
  const deleteGroup = useCallback(
    async (groupId: string): Promise<void> => {
      if (!eventId) throw new Error('No eventId')

      // Find all guests with this groupId
      const guestsQuery = query(
        collection(db, guestsPath(eventId)),
        where('groupId', '==', groupId)
      )
      const affected = await getDocs(guestsQuery)

      const batch = writeBatch(db)
      affected.docs.forEach((d) => {
        batch.update(d.ref, {
          groupId: null,
          updatedAt: serverTimestamp(),
          updatedBy: nowUser(),
        })
      })
      batch.delete(doc(db, groupsPath(eventId), groupId))
      await batch.commit()
    },
    [eventId]
  )

  return { groups, loading, addGroup, updateGroup, deleteGroup }
}
