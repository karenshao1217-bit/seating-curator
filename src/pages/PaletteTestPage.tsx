import { Link } from 'react-router-dom'
import styles from './PaletteTestPage.module.css'

interface Slot {
  key: string
  name: string
  privateHex: string
  businessHex: string
}

const SLOTS: Slot[] = [
  { key: '1', name: '核心金（vip）', privateHex: '#8a6b2e', businessHex: '#b08d4a' },
  { key: '2', name: '核心綠（must）', privateHex: '#2a4b2d', businessHex: '#1f3b34' },
  { key: '3', name: '核心紅（avoid）', privateHex: '#8a2a2a', businessHex: '#b3261e' },
  { key: '4', name: '低飽和 · 暗橄欖/石藍', privateHex: '#4a5132', businessHex: '#2c4a6b' },
  { key: '5', name: '低飽和 · 紫梅', privateHex: '#5c2b3d', businessHex: '#6b3a56' },
  { key: '6', name: '低飽和 · 森林/松綠', privateHex: '#3d4a44', businessHex: '#3a5f4f' },
  { key: '7', name: '中性淺 · 石灰', privateHex: '#a89d87', businessHex: '#a8adb5' },
  { key: '8', name: '中性深 · 褐灰/石墨', privateHex: '#3a352e', businessHex: '#2a3040' },
]

// Alternatives for slot 3 (if we replace the conflict-red)
interface AltSlot3 {
  label: string
  note: string
  privateHex: string
  businessHex: string
}

const SLOT_3_ALTERNATIVES: AltSlot3[] = [
  {
    label: '銅赭（推薦）',
    note: '橘紅偏向，暖色保留但跟衝突紅拉開距離',
    privateHex: '#8a4a2a',
    businessHex: '#a85a3e',
  },
  {
    label: '波爾多酒紅',
    note: '深紅紫，仍是紅系風險較高',
    privateHex: '#6b2e2e',
    businessHex: '#7a2e3a',
  },
  {
    label: '靛青',
    note: '冷色系，打破全暖色配置',
    privateHex: '#2c3a5a',
    businessHex: '#324870',
  },
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

      <section className={styles.section}>
        <p className={styles.sectionLabel}>slot 3 替代候選</p>
        <div className={styles.altList}>
          {/* Current slot 3 shown first for comparison */}
          <div className={styles.altRow}>
            <div
              className={styles.bigChipSm}
              style={{
                background: theme === 'private' ? SLOTS[2].privateHex : SLOTS[2].businessHex,
              }}
            />
            <div
              className={styles.smallChip}
              style={{
                background: theme === 'private' ? SLOTS[2].privateHex : SLOTS[2].businessHex,
              }}
            />
            <div className={styles.altText}>
              <div className={styles.altLabel}>（目前）核心紅</div>
              <div className={styles.altNote}>與衝突語意衝突，需替換</div>
            </div>
          </div>
          {SLOT_3_ALTERNATIVES.map((alt) => (
            <div key={alt.label} className={styles.altRow}>
              <div
                className={styles.bigChipSm}
                style={{
                  background: theme === 'private' ? alt.privateHex : alt.businessHex,
                }}
              />
              <div
                className={styles.smallChip}
                style={{
                  background: theme === 'private' ? alt.privateHex : alt.businessHex,
                }}
              />
              <div className={styles.altText}>
                <div className={styles.altLabel}>{alt.label}</div>
                <div className={styles.altNote}>{alt.note}</div>
              </div>
            </div>
          ))}
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
