/*
 * NoteChipsEditor — dynamic list editor for guest.noteChips[].
 * Each row: [type select][text input][delete button].
 * "+ 新增註記" adds a new row.
 */

import type { NoteChip, NoteChipType } from '../../types/guest'
import styles from './NoteChipsEditor.module.css'

interface Props {
  value: NoteChip[]
  onChange: (chips: NoteChip[]) => void
}

const TYPE_OPTIONS: { value: NoteChipType; label: string; tokenVar: string }[] = [
  { value: 'avoid', label: '不同桌規則', tokenVar: '--avoid' },
  { value: 'must', label: '必同桌規則', tokenVar: '--must' },
  { value: 'social', label: '社交目的', tokenVar: '--ink-2' },
  { value: 'timing', label: '時間約束', tokenVar: '--ink-2' },
]

export default function NoteChipsEditor({ value, onChange }: Props) {
  const updateChip = (i: number, patch: Partial<NoteChip>) => {
    const next = [...value]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  const removeChip = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  const addChip = () => {
    onChange([...value, { type: 'social', text: '' }])
  }

  return (
    <div className={styles.wrapper}>
      {value.length === 0 && (
        <p className={styles.emptyHint}>尚無安排註記</p>
      )}
      {value.map((chip, i) => {
        const meta = TYPE_OPTIONS.find((o) => o.value === chip.type)!
        return (
          <div key={i} className={styles.row}>
            <span
              className={styles.typeDot}
              style={{ background: `var(${meta.tokenVar})` }}
              aria-hidden="true"
            />
            <select
              className={styles.typeSelect}
              value={chip.type}
              onChange={(e) =>
                updateChip(i, { type: e.target.value as NoteChipType })
              }
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              className={styles.textInput}
              value={chip.text}
              onChange={(e) => updateChip(i, { text: e.target.value })}
              placeholder="例：主桌社交·王董 / 早退 / 避免坐在李先生旁"
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeChip(i)}
              aria-label="移除這條註記"
            >
              ✕
            </button>
          </div>
        )
      })}

      <button type="button" className={styles.addBtn} onClick={addChip}>
        ＋ 新增註記
      </button>
    </div>
  )
}
