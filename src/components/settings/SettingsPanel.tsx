/*
 * SettingsPanel — gear icon in top bar + popover panel.
 *
 * Phase 4: only exposes 主題 switch (private / business).
 * Updates events/{eventId}.theme in Firestore on select.
 * Firestore onSnapshot (via useEvent) propagates change → data-theme switches → tokens flip.
 *
 * Permission: Phase 4 allows anyone. Phase 6 will restrict to creator only.
 */

import { useEffect, useRef, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { EventTheme } from '../../hooks/useEvent'
import styles from './SettingsPanel.module.css'

interface Props {
  eventId: string | undefined
  currentTheme: EventTheme
}

const THEME_OPTIONS: {
  value: EventTheme
  label: string
  desc: string
  accent: string
}[] = [
  {
    value: 'private',
    label: '私人晚宴',
    desc: '米白 + 襯線字',
    accent: '#8d6b2e',
  },
  {
    value: 'business',
    label: '商業活動',
    desc: '冷白 + 無襯線字',
    accent: '#0a1020',
  },
]

export default function SettingsPanel({ eventId, currentTheme }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<EventTheme | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const setTheme = async (theme: EventTheme) => {
    if (!eventId || saving || theme === currentTheme) return
    setSaving(theme)
    try {
      await updateDoc(doc(db, 'events', eventId), { theme })
      // onSnapshot updates `currentTheme` automatically; we just close.
      setOpen(false)
    } catch (err) {
      console.error('[SettingsPanel] theme update failed:', err)
      alert('切換主題失敗，請重試')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div ref={rootRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.gearBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="活動設定"
        aria-expanded={open}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className={styles.popover} data-theme={currentTheme} role="dialog">
          <p className={styles.sectionLabel}>THEME</p>
          <h3 className={styles.sectionTitle}>主題</h3>

          <div className={styles.options}>
            {THEME_OPTIONS.map((opt) => {
              const active = currentTheme === opt.value
              const loading = saving === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.option} ${active ? styles.optionActive : ''}`}
                  onClick={() => setTheme(opt.value)}
                  disabled={!!saving}
                >
                  <span
                    className={styles.accent}
                    style={{ background: opt.accent }}
                    aria-hidden="true"
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span className={styles.optionDesc}>{opt.desc}</span>
                  </span>
                  {active && !loading && (
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {loading && <span className={styles.saving}>儲存中…</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
