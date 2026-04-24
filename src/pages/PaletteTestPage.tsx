import { Link } from 'react-router-dom'
import styles from './PaletteTestPage.module.css'

interface Slot {
  key: string
  name: string
  privateHex: string
  businessHex: string
}

const SLOTS: Slot[] = [
  { key: '1', name: '古金 / 暖金', privateHex: '#8a6b2e', businessHex: '#b08d4a' },
  { key: '2', name: '墨綠 / 深綠', privateHex: '#2a4b2d', businessHex: '#1f3b34' },
  { key: '3', name: '靛青 / 深靛藍', privateHex: '#2c3a5a', businessHex: '#1d2554' },
  { key: '4', name: '暗橄欖 / 石藍', privateHex: '#4a5132', businessHex: '#2c4a6b' },
  { key: '5', name: '暗紫梅 / 冷紫梅', privateHex: '#5c2b3d', businessHex: '#6b3a56' },
  { key: '6', name: '灰藍 / 淺石藍', privateHex: '#6a7e90', businessHex: '#6a8ab0' },
  { key: '7', name: '暖石灰 / 冷石灰', privateHex: '#a89d87', businessHex: '#a8adb5' },
  { key: '8', name: '深褐灰 / 石墨', privateHex: '#3a352e', businessHex: '#2a3040' },
]

function ThemePanel({ theme, label }: { theme: 'private' | 'business'; label: string }) {
  return (
    <div className={styles.panel} data-theme={theme}>
      <div className={styles.panelHeader}>
        <p className={styles.panelMicroLabel}>THEME</p>
        <h2 className={styles.panelTitle}>{label}</h2>
        <code className={styles.panelScope}>data-theme=&quot;{theme}&quot;</code>
      </div>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>大 chip · 60×60px</p>
        <div className={styles.bigGrid}>
          {SLOTS.map((s) => (
            <div key={s.key} className={styles.bigCell}>
              <div
                className={styles.bigChip}
                style={{ background: `var(--group-color-${s.key})` }}
              />
              <div className={styles.chipLabel}>
                <code className={styles.slotKey}>slot {s.key}</code>
                <span className={styles.slotName}>{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>小 chip · 20×20px（列表中的實際大小）</p>
        <div className={styles.smallRow}>
          {SLOTS.map((s) => (
            <div key={s.key} className={styles.smallCell}>
              <div
                className={styles.smallChip}
                style={{ background: `var(--group-color-${s.key})` }}
              />
              <code className={styles.smallKey}>{s.key}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>列表情境模擬（小 chip + 名稱）</p>
        <div className={styles.listDemo}>
          {['張家家族', '顧問群', '經營團隊', '股東', '媒體', '贊助商', '同學會', '其他'].map(
            (name, i) => (
              <div key={name} className={styles.listRow}>
                <div
                  className={styles.smallChip}
                  style={{ background: `var(--group-color-${i + 1})` }}
                />
                <span className={styles.listName}>{name}</span>
                <span className={styles.listCount}>{3 + i} 人</span>
              </div>
            )
          )}
        </div>
      </section>

    </div>
  )
}

export default function PaletteTestPage() {
  return (
    <div className={styles.outer}>
      <div className={styles.controls}>
        <Link to="/" className={styles.backLink}>
          ← 返回
        </Link>
        <h1 className={styles.controlsTitle}>Group Palette Preview</h1>
        <p className={styles.hint}>兩主題並排檢查色彩辨識度與小 chip 可讀性</p>
      </div>

      <div className={styles.splitView}>
        <ThemePanel theme="private" label="私人晚宴" />
        <ThemePanel theme="business" label="商業活動" />
      </div>
    </div>
  )
}
