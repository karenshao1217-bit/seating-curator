import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import styles from './NewEventPage.module.css'

type CollaborationMode = 'open' | 'soft' | 'strict'

const MODE_OPTIONS: { value: CollaborationMode; label: string; desc: string }[] = [
  { value: 'open', label: '開放', desc: '任何人可直接進入，不詢問暱稱' },
  { value: 'soft', label: '彈性', desc: '詢問暱稱，但可略過' },
  { value: 'strict', label: '嚴格', desc: '必須填寫暱稱才能進入' },
]

function addToMyEvents(id: string, name: string) {
  try {
    const list = JSON.parse(localStorage.getItem('my_events') || '[]')
    const filtered = list.filter((e: { id: string }) => e.id !== id)
    filtered.unshift({ id, name })
    localStorage.setItem('my_events', JSON.stringify(filtered))
  } catch {
    localStorage.setItem('my_events', JSON.stringify([{ id, name }]))
  }
}

export default function NewEventPage() {
  const navigate = useNavigate()
  const { ensureAuth } = useAuth()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<CollaborationMode>('soft')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || submitting) return

    setSubmitting(true)
    try {
      const user = await ensureAuth()
      const eventRef = doc(collection(db, 'events'))
      const eventId = eventRef.id

      await setDoc(eventRef, {
        name: name.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        venueImageUrl: null,
        venueImageWidth: null,
        venueImageHeight: null,
        collaborationMode: mode,
      })

      await setDoc(doc(db, 'events', eventId, 'sessions', 'default'), {
        name: '主場次',
        createdAt: serverTimestamp(),
      })

      addToMyEvents(eventId, name.trim())
      navigate(`/event/${eventId}`)
    } catch (err) {
      console.error('建立活動失敗:', err)
      alert('建立活動失敗，請稍後再試')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← 返回
      </button>

      <h1 className={styles.title}>建立新活動</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          活動名稱
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：2026 春季晚宴"
            required
            className={styles.input}
          />
        </label>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>協作模式</legend>
          {MODE_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="collaborationMode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => setMode(opt.value)}
              />
              <span className={styles.radioText}>
                <strong>{opt.label}</strong>
                <span className={styles.radioDesc}>{opt.desc}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!name.trim() || submitting}
        >
          {submitting ? '建立中...' : '建立活動'}
        </button>
      </form>
    </div>
  )
}
