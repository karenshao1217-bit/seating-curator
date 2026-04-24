/*
 * GroupFormModal — create/edit group with name input + 8-color palette picker.
 * rule field is NOT shown in UI (Phase 5).
 */

import { useState } from 'react'
import type { Group, GroupInput } from '../../types/guest'
import styles from './GroupFormModal.module.css'

interface BaseProps {
  onClose: () => void
}

interface CreateProps extends BaseProps {
  mode: 'create'
  onSubmit: (input: GroupInput) => Promise<void>
  group?: undefined
  onDelete?: undefined
}

interface EditProps extends BaseProps {
  mode: 'edit'
  group: Group
  onSubmit: (input: GroupInput) => Promise<void>
  onDelete: () => Promise<void>
}

type Props = CreateProps | EditProps

const PALETTE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8']

export default function GroupFormModal(props: Props) {
  const { mode, onClose } = props
  const existing = mode === 'edit' ? props.group : null

  const [name, setName] = useState(existing?.name ?? '')
  const [color, setColor] = useState(existing?.color ?? '1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('請輸入群組名稱')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await props.onSubmit({
        name: name.trim(),
        color,
        rule: existing?.rule ?? 'none',
      })
    } catch (err) {
      console.error('[GroupFormModal] submit failed:', err)
      setError('儲存失敗，請重試')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.microLabel}>
          {mode === 'create' ? 'NEW GROUP' : 'EDIT GROUP'}
        </p>
        <h2 className={styles.title}>
          {mode === 'create' ? '新增群組' : '編輯群組'}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>群組名稱</span>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="例：張家家族、顧問群、經營團隊"
              autoFocus
              maxLength={24}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>色彩</span>
            <div className={styles.palette}>
              {PALETTE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.swatchBtn} ${color === key ? styles.swatchActive : ''}`}
                  style={{ background: `var(--group-color-${key})` }}
                  onClick={() => setColor(key)}
                  aria-label={`色彩 ${key}`}
                >
                  {color === key && <span className={styles.check}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !name.trim()}
            >
              {submitting ? '儲存中…' : mode === 'create' ? '新增' : '儲存'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              取消
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={props.onDelete}
              >
                刪除
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
