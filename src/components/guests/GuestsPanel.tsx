/*
 * GuestsPanel — list view inside the "賓客" tab of SidePanel.
 *
 * Features:
 *   - Name search + group filter (single-select)
 *   - Sorted by created_desc (UI not exposed in Phase 4, data layer supports all)
 *   - Click row → edit modal
 *   - "+ 新增賓客" → create modal
 *   - useGuests hook handles bidirectional sync + cascade delete
 */

import { useMemo, useState } from 'react'
import { useGuests } from '../../hooks/useGuests'
import { useGroups } from '../../hooks/useGroups'
import { sortGuests, type GuestSortBy } from '../../utils/sortGuests'
import GuestListRow from './GuestListRow'
import GuestFormModal from './GuestFormModal'
import type { Guest } from '../../types/guest'
import styles from './GuestsPanel.module.css'

interface Props {
  eventId: string | undefined
}

export default function GuestsPanel({ eventId }: Props) {
  const { guests, loading, addGuest, updateGuest, deleteGuest } =
    useGuests(eventId)
  const { groups } = useGroups(eventId)

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [filterGroupId, setFilterGroupId] = useState<string>('') // '' = all

  // Phase 4: UI only exposes created_desc; data layer supports more
  const sortBy: GuestSortBy = 'created_desc'

  const groupById = useMemo(() => {
    const map = new Map<string, (typeof groups)[number]>()
    groups.forEach((g) => map.set(g.id, g))
    return map
  }, [groups])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return guests.filter((g) => {
      if (filterGroupId && g.groupId !== filterGroupId) return false
      if (!q) return true
      const hay = [g.name, g.displayName, g.company, g.unit, g.title, ...(g.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [guests, search, filterGroupId])

  const sorted = useMemo(() => sortGuests(filtered, sortBy), [filtered, sortBy])

  const allGuestsForPicker = guests // used for avoid/must multi-select in modal

  if (loading) {
    return <p className={styles.loading}>載入中…</p>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.microLabel}>GUESTS</p>
        <h3 className={styles.title}>賓客</h3>
        <p className={styles.hint}>
          {guests.length > 0
            ? `共 ${guests.length} 位` +
              (filtered.length !== guests.length
                ? ` · 篩選出 ${filtered.length} 位`
                : '')
            : '還沒有賓客，開始新增'}
        </p>
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => setShowCreate(true)}
      >
        ＋ 新增賓客
      </button>

      {guests.length > 0 && (
        <div className={styles.filterBar}>
          <input
            type="search"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋姓名 / 公司 / 職稱 / 標籤"
          />
          <select
            className={styles.groupFilter}
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            aria-label="依群組篩選"
          >
            <option value="">所有群組</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {guests.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>還沒有賓客</p>
          <p className={styles.emptySubtitle}>
            可匯入 CSV（下週開放）或手動新增
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptySubtitle}>目前的搜尋/篩選條件沒有賓客</p>
        </div>
      ) : (
        <div className={styles.list}>
          {sorted.map((g) => (
            <GuestListRow
              key={g.id}
              guest={g}
              group={g.groupId ? groupById.get(g.groupId) : undefined}
              onClick={() => setEditingGuest(g)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <GuestFormModal
          mode="create"
          groups={groups}
          allGuests={allGuestsForPicker}
          onSubmit={async (input) => {
            await addGuest(input)
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingGuest && (
        <GuestFormModal
          mode="edit"
          guest={editingGuest}
          groups={groups}
          allGuests={allGuestsForPicker}
          onSubmit={async (input) => {
            await updateGuest(editingGuest.id, input)
            setEditingGuest(null)
          }}
          onDelete={async () => {
            if (
              !window.confirm(
                `確定刪除賓客「${editingGuest.name}」？\n所有排位規則引用該賓客的資料會一併清除。`
              )
            )
              return
            await deleteGuest(editingGuest.id)
            setEditingGuest(null)
          }}
          onClose={() => setEditingGuest(null)}
        />
      )}
    </div>
  )
}
