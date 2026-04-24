/*
 * GuestFormModal — the full guest create/edit form.
 *
 * Sections (single scrollable modal, max-width 640px):
 *   1. 基本       — name, displayName override, honorific, company/unit/title
 *   2. 分類       — groupId, isVIP, tags
 *   3. 排位約束   — avoidGuestIds, mustSameTableGuestIds (via GuestMultiSelect)
 *   4. 排位註記   — noteChips (via NoteChipsEditor)
 *   5. 餐飲       — meal.{type, restrictions, notes}
 *
 * displayName UX: defaults to auto-computed via formatName(name). Small 「自訂」
 * link to the right reveals a manual input pre-filled with the current auto value.
 * Clicking 「恢復自動」clears the override.
 */

import { useState, useMemo } from 'react'
import type {
  Guest,
  GuestInput,
  Group,
  Honorific,
  NoteChip,
  MealInfo,
} from '../../types/guest'
import { computeDefaultDisplayName } from '../../utils/formatName'
import GroupSelect from './GroupSelect'
import GuestMultiSelect from './GuestMultiSelect'
import NoteChipsEditor from './NoteChipsEditor'
import TagsInput from './TagsInput'
import styles from './GuestFormModal.module.css'

interface BaseProps {
  onClose: () => void
  groups: Group[]
  allGuests: Guest[]
}

interface CreateProps extends BaseProps {
  mode: 'create'
  onSubmit: (input: GuestInput) => Promise<void>
  guest?: undefined
  onDelete?: undefined
}

interface EditProps extends BaseProps {
  mode: 'edit'
  guest: Guest
  onSubmit: (input: GuestInput) => Promise<void>
  onDelete: () => Promise<void>
}

type Props = CreateProps | EditProps

const HONORIFIC_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.']
const MEAL_TYPE_OPTIONS = ['葷', '素', '海鮮素', '蛋奶素', '全素', '兒童餐']

function emptyInput(): GuestInput {
  return {
    name: '',
    displayName: undefined,
    honorific: undefined,
    company: '',
    unit: '',
    title: '',
    groupId: null,
    isVIP: false,
    tags: [],
    avoidGuestIds: [],
    mustSameTableGuestIds: [],
    noteChips: [],
    meal: {},
  }
}

function guestToInput(g: Guest): GuestInput {
  return {
    name: g.name,
    displayName: g.displayName,
    honorific: g.honorific,
    company: g.company ?? '',
    unit: g.unit ?? '',
    title: g.title ?? '',
    groupId: g.groupId ?? null,
    isVIP: g.isVIP ?? false,
    tags: g.tags ?? [],
    avoidGuestIds: g.avoidGuestIds ?? [],
    mustSameTableGuestIds: g.mustSameTableGuestIds ?? [],
    noteChips: g.noteChips ?? [],
    meal: g.meal ?? {},
  }
}

export default function GuestFormModal(props: Props) {
  const { mode, onClose, groups, allGuests } = props
  const existing = mode === 'edit' ? props.guest : null

  const [form, setForm] = useState<GuestInput>(() =>
    existing ? guestToInput(existing) : emptyInput()
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // displayName override state
  const [overrideMode, setOverrideMode] = useState(!!form.displayName)

  // honorific custom mode
  const [honorificCustom, setHonorificCustom] = useState(
    !!form.honorific && !HONORIFIC_OPTIONS.includes(form.honorific)
  )

  const autoDisplayName = useMemo(
    () => computeDefaultDisplayName(form.name),
    [form.name]
  )

  const update = <K extends keyof GuestInput>(
    key: K,
    value: GuestInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateMeal = <K extends keyof MealInfo>(
    key: K,
    value: MealInfo[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      meal: { ...prev.meal, [key]: value },
    }))
  }

  const handleOverrideToggle = () => {
    if (overrideMode) {
      // switch back to auto: clear override
      setOverrideMode(false)
      update('displayName', undefined)
    } else {
      // switch to manual: pre-fill with auto
      setOverrideMode(true)
      update('displayName', autoDisplayName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('請輸入姓名')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const cleaned: GuestInput = {
        ...form,
        name: form.name.trim(),
        displayName: overrideMode
          ? (form.displayName?.trim() || undefined)
          : undefined,
        company: form.company?.trim() || '',
        unit: form.unit?.trim() || '',
        title: form.title?.trim() || '',
        noteChips: form.noteChips.filter((c) => c.text.trim()),
      }
      await props.onSubmit(cleaned)
    } catch (err) {
      console.error('[GuestFormModal] submit failed:', err)
      setError('儲存失敗，請重試')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        data-theme="private"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <p className={styles.microLabel}>
            {mode === 'create' ? 'NEW GUEST' : 'EDIT GUEST'}
          </p>
          <h2 className={styles.title}>
            {mode === 'create' ? '新增賓客' : '編輯賓客'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            {/* SECTION 1: 基本 */}
            <section className={styles.section}>
              <p className={styles.sectionLabel}>基本</p>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  姓名 <span className={styles.required}>*</span>
                </span>
                <input
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => {
                    update('name', e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="例：張文彥 / Christopher Lee"
                  autoFocus
                />
              </label>

              <div className={styles.field}>
                <div className={styles.displayNameHeader}>
                  <span className={styles.fieldLabel}>座位圖顯示名</span>
                  <button
                    type="button"
                    className={styles.overrideToggle}
                    onClick={handleOverrideToggle}
                  >
                    {overrideMode ? '恢復自動' : '自訂'}
                  </button>
                </div>
                {overrideMode ? (
                  <input
                    type="text"
                    className={styles.input}
                    value={form.displayName ?? ''}
                    onChange={(e) => update('displayName', e.target.value)}
                    placeholder="例：Chris W."
                  />
                ) : (
                  <div className={styles.autoValue}>
                    <span className={styles.autoValueText}>
                      {autoDisplayName || '（輸入姓名後自動計算）'}
                    </span>
                    <span className={styles.autoValueBadge}>自動計算</span>
                  </div>
                )}
              </div>

              <div className={styles.row2}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>敬稱</span>
                  {honorificCustom ? (
                    <div className={styles.rowInline}>
                      <input
                        type="text"
                        className={styles.input}
                        value={form.honorific ?? ''}
                        onChange={(e) =>
                          update('honorific', e.target.value as Honorific)
                        }
                        placeholder="例：董事長"
                      />
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => {
                          setHonorificCustom(false)
                          update('honorific', undefined)
                        }}
                      >
                        改選
                      </button>
                    </div>
                  ) : (
                    <select
                      className={styles.input}
                      value={form.honorific ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '__custom__') {
                          setHonorificCustom(true)
                          update('honorific', '')
                        } else {
                          update('honorific', (v || undefined) as Honorific)
                        }
                      }}
                    >
                      <option value="">（無）</option>
                      {HONORIFIC_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                      <option value="__custom__">其他…</option>
                    </select>
                  )}
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>職稱</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.title ?? ''}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="例：總經理"
                  />
                </label>
              </div>

              <div className={styles.row2}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>公司</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.company ?? ''}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="例：元豐眾泰"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>單位 / 部門</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.unit ?? ''}
                    onChange={(e) => update('unit', e.target.value)}
                    placeholder="例：業務部"
                  />
                </label>
              </div>
            </section>

            {/* SECTION 2: 分類 */}
            <section className={styles.section}>
              <p className={styles.sectionLabel}>分類</p>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>群組</span>
                <GroupSelect
                  groups={groups}
                  value={form.groupId}
                  onChange={(id) => update('groupId', id)}
                  placeholder="（無群組）"
                />
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={!!form.isVIP}
                  onChange={(e) => update('isVIP', e.target.checked)}
                />
                <span className={styles.checkboxLabel}>
                  <span className={styles.vipTag}>VIP</span>
                  座位圖上以金色顯示
                </span>
              </label>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>標籤</span>
                <TagsInput
                  value={form.tags}
                  onChange={(tags) => update('tags', tags)}
                  placeholder="自由標籤，輸入後按 Enter"
                />
              </div>
            </section>

            {/* SECTION 3: 排位約束 */}
            <section className={styles.section}>
              <p className={styles.sectionLabel}>排位約束</p>
              <p className={styles.sectionHint}>
                Phase 5 座位配置會依此規則衝突提示與自動分桌
              </p>

              <GuestMultiSelect
                allGuests={allGuests}
                groups={groups}
                value={form.avoidGuestIds}
                onChange={(ids) => update('avoidGuestIds', ids)}
                excludeGuestId={existing?.id}
                label="避免同桌"
              />

              <GuestMultiSelect
                allGuests={allGuests}
                groups={groups}
                value={form.mustSameTableGuestIds}
                onChange={(ids) => update('mustSameTableGuestIds', ids)}
                excludeGuestId={existing?.id}
                label="必須同桌"
              />
            </section>

            {/* SECTION 4: 排位註記 */}
            <section className={styles.section}>
              <p className={styles.sectionLabel}>排位註記</p>
              <p className={styles.sectionHint}>
                備註此賓客的排位需求（不同桌 / 必同桌 / 社交目的 / 時間約束）
              </p>

              <NoteChipsEditor
                value={form.noteChips}
                onChange={(chips) => update('noteChips', chips as NoteChip[])}
              />
            </section>

            {/* SECTION 5: 餐飲 */}
            <section className={styles.section}>
              <p className={styles.sectionLabel}>餐飲</p>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>餐點類型</span>
                <select
                  className={styles.input}
                  value={form.meal.type ?? ''}
                  onChange={(e) =>
                    updateMeal('type', e.target.value || undefined)
                  }
                >
                  <option value="">（未指定）</option>
                  {MEAL_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>飲食限制 / 過敏原</span>
                <TagsInput
                  value={form.meal.restrictions ?? []}
                  onChange={(rs) => updateMeal('restrictions', rs)}
                  placeholder="例：花生、海鮮過敏、不吃牛"
                />
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>餐飲備註</span>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={form.meal.notes ?? ''}
                  onChange={(e) => updateMeal('notes', e.target.value)}
                  placeholder="其他餐飲偏好或提醒"
                />
              </label>
            </section>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !form.name.trim()}
            >
              {submitting ? '儲存中…' : mode === 'create' ? '新增' : '儲存'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              取消
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={props.onDelete}
              >
                刪除
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
