/*
 * formatName — canonical name formatting for the entire app.
 *
 * Source of truth: docs/Seating Curator _ Design Handoff Notes.md §3.2
 * Single utility used by:
 *   - Phase 4 guest list (detail view, full name)
 *   - Phase 4 CSV import (compute default displayName)
 *   - Phase 5 seat labels on canvas (abbreviated form, clamped)
 *   - Phase 7 print/export (detail rows)
 *
 * Behavior:
 *   1. Honorific stripping — Dr./Mr./Mrs./Ms./Miss/Prof./Rev./Sir/Lord/Lady/Hon./Capt./Col./Gen.
 *      prefixes removed. Stored on the record but never shown.
 *   2. Suffix stripping — Jr./Sr./II/III/IV/PhD/MD/Esq. suffixes removed.
 *   3. CJK detection — Chinese/Japanese/Korean names are NEVER abbreviated.
 *   4. Latin abbreviation (abbrev=true) — if name >11 chars OR ≥3 tokens:
 *      return `Firstname L.` (first token + last token's leading letter)
 *   5. Hard cap (clampLong=true, only on seat labels) — if name >22 chars,
 *      force abbreviation. Hyphenated last names (Al-Saud, Chen-Matthews)
 *      take the letter before the hyphen.
 */

// Honorifics: match case-insensitively, with or without trailing period
const HONORIFICS = [
  'Dr', 'Mr', 'Mrs', 'Ms', 'Miss', 'Prof', 'Rev',
  'Sir', 'Lord', 'Lady', 'Hon', 'Capt', 'Col', 'Gen',
]

// Suffixes (matched as last token, case-insensitive, period optional)
const SUFFIXES = ['Jr', 'Sr', 'II', 'III', 'IV', 'V', 'PhD', 'MD', 'Esq']

export interface FormatNameOptions {
  /** Strip honorific prefix (Dr./Mr. etc). Default: true. */
  stripHonorific?: boolean
  /** Enable Latin abbreviation (Firstname L.) if name >11 chars or ≥3 tokens. Default: false. */
  abbrev?: boolean
  /**
   * Hard cap for seat labels only. If Latin name >22 chars, force abbreviate
   * regardless of `abbrev`. Default: false.
   */
  clampLong?: boolean
}

const CJK_REGEX = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/

function isCJK(str: string): boolean {
  return CJK_REGEX.test(str)
}

function stripHonorificPrefix(name: string): string {
  for (const h of HONORIFICS) {
    const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`^${escaped}\\.?\\s+`, 'i')
    if (regex.test(name)) {
      return name.replace(regex, '').trim()
    }
  }
  return name
}

function stripSuffixToken(name: string): string {
  const tokens = name.split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return name
  const last = tokens[tokens.length - 1]
  const normalized = last.replace(/\.$/, '').toUpperCase()
  if (SUFFIXES.some((s) => s.toUpperCase() === normalized)) {
    return tokens.slice(0, -1).join(' ')
  }
  return name
}

function abbreviateLatin(name: string): string {
  const tokens = name.split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return name
  const first = tokens[0]
  const last = tokens[tokens.length - 1]
  // Hyphenated last name: take letter before first hyphen
  const initial = last.split('-')[0].charAt(0).toUpperCase()
  return `${first} ${initial}.`
}

export function formatName(
  rawName: string,
  opts: FormatNameOptions = {}
): string {
  const { stripHonorific = true, abbrev = false, clampLong = false } = opts

  const input = (rawName || '').trim()
  if (!input) return ''

  // 1. Strip honorific (optional)
  const afterHonorific = stripHonorific ? stripHonorificPrefix(input) : input

  // 2. CJK short-circuit — return as-is, no abbreviation
  if (isCJK(afterHonorific)) {
    return afterHonorific
  }

  // 3. Strip suffix
  const stripped = stripSuffixToken(afterHonorific)

  // 4. Decide abbreviation
  const tokens = stripped.split(/\s+/).filter(Boolean)
  const tooLong = stripped.length > 11
  const manyTokens = tokens.length >= 3
  const overHardCap = clampLong && stripped.length > 22

  const shouldAbbrev =
    (abbrev && (tooLong || manyTokens)) || overHardCap

  if (shouldAbbrev && tokens.length >= 2) {
    return abbreviateLatin(stripped)
  }

  return stripped
}

/**
 * Compute the default displayName for a guest — what we'd store on create
 * if the user doesn't manually override.
 *
 * Rule: CJK stays full, Latin gets abbreviated via formatName with abbrev=true.
 */
export function computeDefaultDisplayName(rawName: string): string {
  return formatName(rawName, { stripHonorific: true, abbrev: true })
}
