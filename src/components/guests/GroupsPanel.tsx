/*
 * GroupsPanel — list view inside the "群組" tab of SidePanel.
 *
 * Responsibilities:
 *   - List all groups for this event with color swatch + name + member count
 *   - "+ 新增群組" button opens GroupFormModal in create mode
 *   - Click a group to edit (opens modal in edit mode)
 *   - Delete action (with confirmation; cascade clears guest.groupId)
 *
 * Design tokens applied — consumer wraps this in <div data-theme="...">
 */

import { useState, useMemo } from 'react'
import { useGroups } from '../../hooks/useGroups'
import { useGuests } from '../../hooks/useGuests'
import GroupFormModal from './GroupFormModal'
import type { Group } from '../../types/guest'
import styles from './GroupsPanel.module.css'

interface Props {
  eventId: string | undefined
}

export default function GroupsPanel({ eventId }: Props) {
  const { groups, loading, addGroup, updateGroup, deleteGroup } = useGroups(eventId)
  const { guests } = useGuests(eventId)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Compute member count per group
  const memberCountByGroup = useMemo(() => {
    const map = new Map<string, number>()
    guests.forEach((g) => {
      if (g.groupId) {
        map.set(g.groupId, (map.get(g.groupId) ?? 0) + 1)
      }
    })
    return map
  }, [guests])

  if (loading) {
    return <p className={styles.loading}>載入中…</p>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.microLabel}>GROUPS</p>
        <h3 className={styles.title}>群組</h3>
        <p className={styles.hint}>
          用於視覺標記與排位規則（Phase 5 生效）
        </p>
      </div>

      <button
        className={styles.addBtn}
        onClick={() => setShowCreate(true)}
        type="button"
      >
        ＋ 新增群組
      </button>

      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>還沒有群組</p>
          <p className={styles.emptySubtitle}>
            可先建立群組架構，再把賓客分類進去
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {groups.map((g) => {
            const count = memberCountByGroup.get(g.id) ?? 0
            return (
              <li
                key={g.id}
                className={styles.row}
                onClick={() => setEditingGroup(g)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setEditingGroup(g)
                }}
              >
                <span
                  className={styles.swatch}
                  style={{ background: `var(--group-color-${g.color})` }}
                />
                <span className={styles.name}>{g.name}</span>
                <span className={styles.count}>{count} 人</span>
              </li>
            )
          })}
        </ul>
      )}

      {showCreate && (
        <GroupFormModal
          mode="create"
          onSubmit={async (input) => {
            await addGroup(input)
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingGroup && (
        <GroupFormModal
          mode="edit"
          group={editingGroup}
          onSubmit={async (input) => {
            await updateGroup(editingGroup.id, input)
            setEditingGroup(null)
          }}
          onDelete={async () => {
            const count = memberCountByGroup.get(editingGroup.id) ?? 0
            const msg =
              count > 0
                ? `群組「${editingGroup.name}」目前有 ${count} 位賓客。刪除後這些賓客會變成無群組。確定刪除？`
                : `確定刪除群組「${editingGroup.name}」？`
            if (!window.confirm(msg)) return
            await deleteGroup(editingGroup.id)
            setEditingGroup(null)
          }}
          onClose={() => setEditingGroup(null)}
        />
      )}
    </div>
  )
}
