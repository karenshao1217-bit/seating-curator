import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface EventData {
  name: string
  createdAt: unknown
  createdBy: string
  venueImageUrl: string | null
  venueImageWidth: number | null
  venueImageHeight: number | null
  collaborationMode: 'open' | 'soft' | 'strict'
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    const unsub = onSnapshot(doc(db, 'events', eventId), (snap) => {
      if (snap.exists()) {
        setEvent(snap.data() as EventData)
      }
      setLoading(false)
    })
    return unsub
  }, [eventId])

  return { event, loading }
}
