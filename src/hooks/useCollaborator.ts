import { useState, useEffect, useCallback } from 'react'
import type { EventData } from './useEvent'

interface CollaboratorState {
  nickname: string | null
  displayName: string
  needsModal: boolean
  resolved: boolean
}

export function useCollaborator(
  eventId: string | undefined,
  event: EventData | null,
  uid: string | undefined
) {
  const [state, setState] = useState<CollaboratorState>({
    nickname: null,
    displayName: '',
    needsModal: false,
    resolved: false,
  })

  useEffect(() => {
    if (!eventId || !event) return

    const key = `collaborator_${eventId}`
    const saved = localStorage.getItem(key)

    if (saved) {
      setState({
        nickname: saved,
        displayName: saved,
        needsModal: false,
        resolved: true,
      })
      return
    }

    switch (event.collaborationMode) {
      case 'open':
        setState({
          nickname: null,
          displayName: '',
          needsModal: false,
          resolved: true,
        })
        break
      case 'soft':
        setState({
          nickname: null,
          displayName: uid ? `訪客${uid.slice(-4)}` : '訪客',
          needsModal: true,
          resolved: false,
        })
        break
      case 'strict':
        setState({
          nickname: null,
          displayName: '',
          needsModal: true,
          resolved: false,
        })
        break
    }
  }, [eventId, event, uid])

  const setNickname = useCallback(
    (name: string) => {
      if (!eventId) return
      const key = `collaborator_${eventId}`
      localStorage.setItem(key, name)
      setState({
        nickname: name,
        displayName: name,
        needsModal: false,
        resolved: true,
      })
    },
    [eventId]
  )

  const skip = useCallback(() => {
    if (!eventId) return
    const fallback = uid ? `訪客${uid.slice(-4)}` : '訪客'
    setState({
      nickname: null,
      displayName: fallback,
      needsModal: false,
      resolved: true,
    })
  }, [eventId, uid])

  return { ...state, setNickname, skip }
}
