/*
 * TagsInput — chip-style free-form tag input.
 * Type + Enter to add. Backspace on empty removes last.
 */

import { useState } from 'react'
import styles from './TagsInput.module.css'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  ariaLabel?: string
}

export default function TagsInput({
  value,
  onChange,
  placeholder = '輸入後按 Enter 新增',
  ariaLabel,
}: Props) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const t = input.trim()
    if (!t) return
    if (!value.includes(t)) {
      onChange([...value, t])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className={styles.wrapper} aria-label={ariaLabel}>
      {value.map((t) => (
        <span key={t} className={styles.chip}>
          {t}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeTag(t)}
            aria-label={`移除 ${t}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1])
          }
        }}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className={styles.input}
      />
    </div>
  )
}
