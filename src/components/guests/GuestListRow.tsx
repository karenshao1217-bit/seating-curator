/*
 * GuestListRow — single row in the guest list.
 *
 * Layout (left to right):
 *   [group color dot] [name (VIP colored if applicable)] [company · title]
 *   [note chip count badge if any]
 *
 * Clicking the row opens the guest edit modal (handled by parent).
 */

import type { Guest, Group } from '../../types/guest'
import { formatName } from '../../utils/formatName'
import styles from './GuestListRow.module.css'

interface Props {
  guest: Guest
  group?: Group
  onClick: () => void
}

export default function GuestListRow({ guest, group, onClick }: Props) {
  const displayName = guest.displayName || formatName(guest.name)
  const subtitle = [guest.company, guest.title].filter(Boolean).join(' · ')
  const noteCount = guest.noteChips.length

  return (
    <button
      type="button"
      className={styles.row}
      onClick={onClick}
    >
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

      <div className={styles.main}>
        <div className={styles.nameLine}>
          <span
            className={`${styles.name} ${guest.isVIP ? styles.nameVip : ''}`}
          >
            {displayName}
          </span>
          {guest.isVIP && <span className={styles.vipBadge}>VIP</span>}
        </div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>

      {noteCount > 0 && (
        <span className={styles.noteBadge} title={`${noteCount} 條註記`}>
          {noteCount}
        </span>
      )}
    </button>
  )
}
