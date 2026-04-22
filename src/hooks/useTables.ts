import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateSeats } from '../utils/generateSeats'

export interface SeatData {
  id: string
  label: string
  relX: number
  relY: number
  guestId: string | null
}

export interface TableData {
  id: string
  shape: 'round' | 'rect' | 'long'
  label: string
  x: number
  y: number
  rotation: number
  widthCm: number
  heightCm: number
  capacity: number
  seats: SeatData[]
}

export interface AddTableInput {
  shape: 'round' | 'rect' | 'long'
  label: string
  widthCm: number
  heightCm: number
  capacity: number
  x: number
  y: number
}

function tablesPath(eventId: string) {
  return `events/${eventId}/sessions/default/tables`
}

export function useTables(eventId: string | undefined) {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    const tablesRef = collection(db, tablesPath(eventId))
    const seatUnsubs: (() => void)[] = []

    const unsub = onSnapshot(tablesRef, (snapshot) => {
      // Clean up previous seat listeners
      seatUnsubs.forEach((u) => u())
      seatUnsubs.length = 0

      const tableMap = new Map<string, TableData>()

      snapshot.docs.forEach((d) => {
        const data = d.data()
        tableMap.set(d.id, {
          id: d.id,
          shape: data.shape,
          label: data.label,
          x: data.x,
          y: data.y,
          rotation: data.rotation || 0,
          widthCm: data.widthCm,
          heightCm: data.heightCm,
          capacity: data.capacity,
          seats: [],
        })
      })

      // Listen to seats for each table
      let pending = snapshot.docs.length
      if (pending === 0) {
        setTables([])
        setLoading(false)
        return
      }

      snapshot.docs.forEach((d) => {
        const seatsRef = collection(db, tablesPath(eventId), d.id, 'seats')
        const seatUnsub = onSnapshot(seatsRef, (seatSnap) => {
          const table = tableMap.get(d.id)
          if (table) {
            table.seats = seatSnap.docs.map((s) => ({
              id: s.id,
              label: s.data().label,
              relX: s.data().relX,
              relY: s.data().relY,
              guestId: s.data().guestId || null,
            }))
          }
          pending = Math.max(0, pending - 1)
          if (pending === 0) {
            setTables(Array.from(tableMap.values()))
            setLoading(false)
          } else {
            // Always update to reflect latest seat changes
            setTables(Array.from(tableMap.values()))
          }
        })
        seatUnsubs.push(seatUnsub)
      })
    })

    return () => {
      unsub()
      seatUnsubs.forEach((u) => u())
    }
  }, [eventId])

  const addTable = useCallback(
    async (input: AddTableInput) => {
      if (!eventId) return

      const tableRef = doc(collection(db, tablesPath(eventId)))
      const seats = generateSeats(
        input.shape,
        input.widthCm,
        input.heightCm,
        input.capacity,
        input.label
      )

      const batch = writeBatch(db)

      batch.set(tableRef, {
        shape: input.shape,
        label: input.label,
        x: input.x,
        y: input.y,
        rotation: 0,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        capacity: input.capacity,
        createdAt: serverTimestamp(),
      })

      seats.forEach((seat) => {
        const seatRef = doc(collection(db, tablesPath(eventId), tableRef.id, 'seats'))
        batch.set(seatRef, {
          label: seat.label,
          relX: seat.relX,
          relY: seat.relY,
          guestId: null,
        })
      })

      await batch.commit()
    },
    [eventId]
  )

  const updateTable = useCallback(
    async (tableId: string, updates: Partial<{ x: number; y: number; rotation: number }>) => {
      if (!eventId) return
      const tableRef = doc(db, tablesPath(eventId), tableId)
      await updateDoc(tableRef, updates)
    },
    [eventId]
  )

  const deleteTable = useCallback(
    async (tableId: string) => {
      if (!eventId) return

      // Delete all seats first
      const seatsRef = collection(db, tablesPath(eventId), tableId, 'seats')
      const table = tables.find((t) => t.id === tableId)
      if (table) {
        const batch = writeBatch(db)
        table.seats.forEach((s) => {
          batch.delete(doc(db, tablesPath(eventId), tableId, 'seats', s.id))
        })
        batch.delete(doc(db, tablesPath(eventId), tableId))
        await batch.commit()
      } else {
        await deleteDoc(doc(db, tablesPath(eventId), tableId))
      }
    },
    [eventId, tables]
  )

  return { tables, loading, addTable, updateTable, deleteTable }
}
