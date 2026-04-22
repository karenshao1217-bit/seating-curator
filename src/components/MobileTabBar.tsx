import styles from './MobileTabBar.module.css'

export type MobileTab = 'venue' | 'guests' | 'export'

interface Props {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
}

const TABS: { key: MobileTab; label: string }[] = [
  { key: 'venue', label: '場地' },
  { key: 'guests', label: '賓客' },
  { key: 'export', label: '匯出' },
]

export default function MobileTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
