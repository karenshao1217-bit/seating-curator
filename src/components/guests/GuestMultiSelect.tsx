/*
 * GuestMultiSelect — searchable checklist for picking multiple guests.
 * Used for avoidGuestIds and mustSameTableGuestIds fields.
 *
 * Layout:
 *   [Label · 已選 N 位]
 *   [Search input]
 *   [Scrollable checklist, max-height ~180px]
 *     each row: [checkbox] [group dot] [name + VIP mark] [company/unit]
 */

import { useMemo, useState } from 'react'
import type { Guest, Group } from '../../types/guest'
import { formatName } from '../../utils/formatName'
import styles from './GuestMultiSelect.module.css'

interface Props {
  allGuests: Guest[]
  groups: Group[]
  value: string[]
  onChange: (ids: string[]) => void
  excludeGuestId?: string
  label: string
}

export default function GuestMultiSelect({
  allGuests,
  groups,
  value,
  onChange,
  excludeGuestId,
  label,
}: Props) {
  const [search, setSearch] = useState('')

  const groupById = useMemo(() => {
    const map = new Map<string, Group>()
    groups.forEach((g) => map.set(g.id, g))
    return map
  }, [groups])

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allGuests
      .filter((g) => g.id !== excludeGuestId)
      .filter((g) => {
        if (!q) return true
        const hay = [g.name, g.company, g.unit, g.title]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
  }, [allGuests, excludeGuestId, search])

  const selectedSet = useMemo(() => new Set(value), [value])

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>
          {value.length > 0 ? `已選 ${value.length} 位` : '無'}
        </span>
      </div>

      {allGuests.length === 0 ? (
        <p className={styles.emptyHint}>尚無其他賓客可選</p>
      ) : (
        <>
          <input
            type="search"
            className={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋賓客（姓名 / 公司 / 職稱）"
          />

          <div className={styles.list}>
            {candidates.length === 0 ? (
              <p className={styles.noMatch}>查無符合的賓客</p>
            ) : (
              candidates.map((g) => {
                const group = g.groupId ? groupById.get(g.groupId) : null
                const checked = selectedSet.has(g.id)
                return (
                  <label
                    key={g.id}
                    className={`${styles.row} ${checked ? styles.rowChecked : ''}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checked}
                      onChange={() => toggle(g.id)}
                    />
                    <span
                      className={styles.groupDot}
                      style={{
                        background: group
                          ? `var(--group-color-${group.color})`
                          : 'transparent',
                        borderColor: group ? 'transparent' : 'var(--line-3)',
                      }}
                      aria-hidden="true"
                    />
                    <span
                      className={`${styles.name} ${g.isVIP ? styles.nameVip : ''}`}
                    >
                      {formatName(g.name)}
                    </span>
                    {(g.company || g.title) && (
                      <span className={styles.meta}>
                        {[g.company, g.title].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </label>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
