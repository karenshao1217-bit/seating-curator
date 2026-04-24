import { useState } from 'react'
import GroupsPanel from './guests/GroupsPanel'
import styles from './SidePanel.module.css'

type Tab = 'guests' | 'groups' | 'changelog'

interface Props {
  eventId: string | undefined
}

export default function SidePanel({ eventId }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('guests')

  if (collapsed) {
    return (
      <div className={styles.collapsed}>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(false)}
          title="展開面板"
        >
          ‹
        </button>
      </div>
    )
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'guests' ? styles.active : ''}`}
            onClick={() => setActiveTab('guests')}
          >
            賓客
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            群組
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'changelog' ? styles.active : ''}`}
            onClick={() => setActiveTab('changelog')}
          >
            歷程
          </button>
        </div>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(true)}
          title="收合面板"
        >
          ›
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'guests' && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>還沒有賓客</p>
            <p className={styles.emptySubtitle}>可匯入 CSV 或手動新增</p>
            <button className={styles.emptyBtn}>新增賓客</button>
          </div>
        )}
        {activeTab === 'groups' && (
          <div className={styles.themed} data-theme="private">
            <GroupsPanel eventId={eventId} />
          </div>
        )}
        {activeTab === 'changelog' && (
          <p className={styles.placeholder}>修改歷程（Phase 6）</p>
        )}
      </div>
    </aside>
  )
}
