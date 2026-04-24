import { Link } from 'react-router-dom'
import styles from './PaletteTestPage.module.css'

interface Slot {
  key: string
  name: string
  privateHex: string
  businessHex: string
}

const SLOTS: Slot[] = [
  { key: '1', name: '金 · 中亮金黃', privateHex: '#8d6b2e', businessHex: '#b28c3f' },
  { key: '2', name: '綠 · 中亮綠', privateHex: '#487d4f', businessHex: '#367859' },
  { key: '3', name: '梅 · 中亮粉紫', privateHex: '#954f6e', businessHex: '#9e5476' },
  { key: '4', name: '松石綠 / 孔雀藍 · teal', privateHex: '#3d7a82', businessHex: '#2d8aa8' },
  { key: '5', name: '淡藍 · 淺色 1', privateHex: '#a8c0d6', businessHex: '#b1c9e3' },
  { key: '6', name: '苔綠 · 淺色 2', privateHex: '#b4bea4', businessHex: '#a8c7b9' },
  { key: '7', name: '墨黑 · 深色錨點', privateHex: '#2d2821', businessHex: '#1a1e2c' },
  { key: '8', name: '暖石 / 冷石 · 中性淺灰', privateHex: '#c5bfb3', businessHex: '#c4c7cd' },
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
