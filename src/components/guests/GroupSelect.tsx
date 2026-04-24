/*
 * GroupSelect — reusable dropdown for choosing a group (used by guest form).
 *
 * Displays each group's color swatch inline with its name. Use null for "無群組".
 * Designed to be used inside a data-theme scope so colors match active theme.
 */

import type { Group } from '../../types/guest'
import styles from './GroupSelect.module.css'

interface Props {
  groups: Group[]
  value: string | null | undefined
  onChange: (groupId: string | null) => void
  disabled?: boolean
  placeholder?: string
}

export default function GroupSelect({
  groups,
  value,
  onChange,
  disabled,
  placeholder = '（無群組）',
}: Props) {
  const selectedGroup = groups.find((g) => g.id === value)

  return (
    <div className={styles.wrapper}>
      {selectedGroup && (
        <span
          className={styles.selectedSwatch}
          style={{ background: `var(--group-color-${selectedGroup.color})` }}
          aria-hidden="true"
        />
      )}
      <select
        className={`${styles.select} ${selectedGroup ? styles.hasSelection : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  )
}
