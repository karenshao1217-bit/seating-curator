import { useState } from 'react'
import styles from './AddTableModal.module.css'

type TableShape = 'round' | 'rect' | 'long'

export interface AddTableData {
  shape: TableShape
  label: string
  widthCm: number
  heightCm: number
  capacity: number
}

interface Props {
  onSubmit: (tables: AddTableData[]) => Promise<void>
  onClose: () => void
}

const SHAPE_OPTIONS: { value: TableShape; label: string }[] = [
  { value: 'round', label: '圓桌' },
  { value: 'rect', label: '方桌' },
  { value: 'long', label: '長桌' },
]

const SHAPE_DEFAULTS: Record<TableShape, { w: number; h: number; cap: number }> = {
  round: { w: 180, h: 180, cap: 10 },
  rect: { w: 120, h: 120, cap: 8 },
  long: { w: 240, h: 90, cap: 10 },
}

function parseLabel(label: string): { prefix: string; num: number } | null {
  const match = label.match(/^(.*?)(\d+)$/)
  if (!match) return null
  return { prefix: match[1], num: parseInt(match[2], 10) }
}

function generateLabels(startLabel: string, count: number): string[] {
  const parsed = parseLabel(startLabel)
  if (!parsed) {
    return Array.from({ length: count }, (_, i) =>
      i === 0 ? startLabel : `${startLabel}-${i + 1}`
    )
  }
  const { prefix, num } = parsed
  const numLen = startLabel.length - prefix.length
  return Array.from({ length: count }, (_, i) =>
    `${prefix}${String(num + i).padStart(numLen, '0')}`
  )
}

export default function AddTableModal({ onSubmit, onClose }: Props) {
  const [shape, setShape] = useState<TableShape>('round')
  const [label, setLabel] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [widthCm, setWidthCm] = useState(SHAPE_DEFAULTS.round.w)
  const [heightCm, setHeightCm] = useState(SHAPE_DEFAULTS.round.h)
  const [capacity, setCapacity] = useState(SHAPE_DEFAULTS.round.cap)
  const [submitting, setSubmitting] = useState(false)

  const isBatch = quantity > 1
  const previewLabels = isBatch && label.trim()
    ? generateLabels(label.trim(), Math.min(quantity, 5))
    : []

  const handleShapeChange = (s: TableShape) => {
    setShape(s)
    const d = SHAPE_DEFAULTS[s]
    setWidthCm(d.w)
    setHeightCm(d.h)
    setCapacity(d.cap)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || capacity < 1 || submitting) return
    setSubmitting(true)
    try {
      const labels = isBatch
        ? generateLabels(label.trim(), quantity)
        : [label.trim()]
      const tables: AddTableData[] = labels.map((l) => ({
        shape,
        label: l,
        widthCm,
        heightCm,
        capacity,
      }))
      await onSubmit(tables)
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>新增桌子</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sizeRow}>
            <label className={styles.label}>
              數量
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                min={1}
                max={50}
                className={styles.input}
              />
            </label>
            <label className={styles.label} style={{ flex: 2 }}>
              {isBatch ? '起始桌號' : '桌號標籤'}
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={isBatch ? '例：A1' : '例：A1'}
                required
                className={styles.input}
                autoFocus
              />
            </label>
          </div>

          {isBatch && previewLabels.length > 0 && (
            <p className={styles.preview}>
              將建立：{previewLabels.join('、')}
              {quantity > 5 && `...（共 ${quantity} 張）`}
            </p>
          )}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>桌型</legend>
            <div className={styles.radioGroup}>
              {SHAPE_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shape"
                    value={opt.value}
                    checked={shape === opt.value}
                    onChange={() => handleShapeChange(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.sizeRow}>
            <label className={styles.label}>
              {shape === 'round' ? '直徑 (cm)' : '寬 (cm)'}
              <input
                type="number"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                min={50}
                max={500}
                className={styles.input}
              />
            </label>
            {shape !== 'round' && (
              <label className={styles.label}>
                高 (cm)
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  min={50}
                  max={500}
                  className={styles.input}
                />
              </label>
            )}
          </div>

          <label className={styles.label}>
            容納人數
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              max={50}
              required
              className={styles.input}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!label.trim() || capacity < 1 || submitting}
            >
              {submitting
                ? '新增中...'
                : isBatch
                  ? `新增 ${quantity} 張`
                  : '新增'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
