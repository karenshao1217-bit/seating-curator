import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ThemeTestPage.module.css'

type Theme = 'private' | 'business'

const COLOR_TOKENS = [
  { name: '--bg-canvas', group: 'Background' },
  { name: '--bg-surface', group: 'Background' },
  { name: '--bg-sunken', group: 'Background' },
  { name: '--bg-hover', group: 'Background' },
  { name: '--ink-1', group: 'Ink' },
  { name: '--ink-2', group: 'Ink' },
  { name: '--ink-3', group: 'Ink' },
  { name: '--line-1', group: 'Line' },
  { name: '--line-2', group: 'Line' },
  { name: '--line-3', group: 'Line' },
  { name: '--accent', group: 'Accent' },
  { name: '--accent-soft', group: 'Accent' },
  { name: '--vip', group: 'Semantic' },
  { name: '--must', group: 'Semantic' },
  { name: '--avoid', group: 'Semantic' },
]

const FONT_SIZE_TOKENS = [
  '--fs-micro',
  '--fs-caption',
  '--fs-body',
  '--fs-h3',
  '--fs-h2',
  '--fs-h1',
  '--fs-display',
]

export default function ThemeTestPage() {
  const [theme, setTheme] = useState<Theme>('private')

  return (
    <div className={styles.outer}>
      {/* Toggle lives outside the scope so its appearance stays stable */}
      <div className={styles.controls}>
        <Link to="/" className={styles.backLink}>
          ← 返回
        </Link>
        <h1 className={styles.controlsTitle}>Tokens Test Page</h1>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${theme === 'private' ? styles.active : ''}`}
            onClick={() => setTheme('private')}
          >
            private · 私人晚宴
          </button>
          <button
            className={`${styles.toggleBtn} ${theme === 'business' ? styles.active : ''}`}
            onClick={() => setTheme('business')}
          >
            business · 商業活動
          </button>
        </div>
        <p className={styles.currentTheme}>
          Current: <code>data-theme=&quot;{theme}&quot;</code>
        </p>
      </div>

      {/* Scoped area — all tokens resolve against data-theme */}
      <div className={styles.scope} data-theme={theme}>
        <section className={styles.section}>
          <p className={styles.microLabel}>SECTION</p>
          <h2 className={styles.sectionTitle}>字型堆疊</h2>
          <div className={styles.fontSamples}>
            <div className={styles.fontSample}>
              <span className={styles.fontLabel}>font-zh</span>
              <p className={styles.fontZh}>
                中文字型示範：張董事長與王總裁歡迎蒞臨晚宴
              </p>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.fontLabel}>font-en</span>
              <p className={styles.fontEn}>
                The quick brown fox jumps over the lazy dog — 1234567890
              </p>
            </div>
            <div className={styles.fontSample}>
              <span className={styles.fontLabel}>font-mono</span>
              <p className={styles.fontMono}>Table A · Seat 01 · #A01-03</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.microLabel}>SECTION</p>
          <h2 className={styles.sectionTitle}>字級 ramp</h2>
          <div className={styles.fontSizes}>
            {FONT_SIZE_TOKENS.map((token) => (
              <div key={token} className={styles.fontSizeRow}>
                <code className={styles.fontSizeToken}>{token}</code>
                <span
                  className={styles.fontSizeSample}
                  style={{ fontSize: `var(${token})` }}
                >
                  Sample 樣本 — The quick brown fox
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.microLabel}>SECTION</p>
          <h2 className={styles.sectionTitle}>色彩 tokens</h2>
          <div className={styles.colorGrid}>
            {COLOR_TOKENS.map((tok) => (
              <div key={tok.name} className={styles.colorCell}>
                <div
                  className={styles.swatch}
                  style={{ background: `var(${tok.name})` }}
                />
                <code className={styles.colorName}>{tok.name}</code>
                <span className={styles.colorGroup}>{tok.group}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.microLabel}>SECTION</p>
          <h2 className={styles.sectionTitle}>實際組合示範</h2>
          <div className={styles.demoCard}>
            <p className={styles.demoMicroLabel}>TABLE A · ROUND · 10 SEATS</p>
            <h3 className={styles.demoTitle}>主桌</h3>
            <ul className={styles.demoList}>
              <li>
                <span className={styles.demoSeatNum}>1</span>
                <span className={styles.demoNameVip}>張董事長 Chairman Chang</span>
              </li>
              <li>
                <span className={styles.demoSeatNum}>2</span>
                <span className={styles.demoName}>王美華 Mei-Hua Wang</span>
              </li>
              <li>
                <span className={styles.demoSeatNum}>3</span>
                <span className={styles.demoName}>許慶雄 Ching-Hsiung Hsu</span>
              </li>
              <li className={styles.demoConflict}>
                <span className={styles.demoSeatNum}>4</span>
                <span className={styles.demoName}>
                  李志明 Chih-Ming Lee
                  <span className={styles.demoBang}>！</span>
                </span>
              </li>
            </ul>
            <div className={styles.demoFooter}>
              <span className={styles.demoStat}>賓客 10 · 衝突 1</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.microLabel}>SECTION</p>
          <h2 className={styles.sectionTitle}>radius & shadow</h2>
          <div className={styles.utilityGrid}>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ borderRadius: 'var(--radius-xs)' }}
              />
              <code>--radius-xs (2px)</code>
            </div>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
              <code>--radius-sm (4px)</code>
            </div>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ borderRadius: 'var(--radius-md)' }}
              />
              <code>--radius-md (6px)</code>
            </div>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ borderRadius: 'var(--radius-lg)' }}
              />
              <code>--radius-lg (10px)</code>
            </div>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              />
              <code>--shadow-sm</code>
            </div>
            <div className={styles.utilityCell}>
              <div
                className={styles.utilityBox}
                style={{ boxShadow: 'var(--shadow-md)' }}
              />
              <code>--shadow-md</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
