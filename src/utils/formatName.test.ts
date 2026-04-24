import { describe, it, expect } from 'vitest'
import { formatName, computeDefaultDisplayName } from './formatName'

describe('formatName — CJK names (never abbreviated)', () => {
  it('純中文：張文彥 → 張文彥', () => {
    expect(formatName('張文彥', { abbrev: true })).toBe('張文彥')
  })

  it('長中文名不縮寫', () => {
    expect(formatName('張文彥明德成', { abbrev: true, clampLong: true })).toBe(
      '張文彥明德成'
    )
  })

  it('日文名不縮寫', () => {
    expect(formatName('田中太郎', { abbrev: true })).toBe('田中太郎')
  })

  it('混中英以中文判斷保留全名', () => {
    expect(formatName('Dr. 張文彥', { abbrev: true })).toBe('張文彥')
  })
})

describe('formatName — Latin short names (no abbreviation)', () => {
  it('短英文：John Lee → John Lee', () => {
    expect(formatName('John Lee', { abbrev: true })).toBe('John Lee')
  })

  it('單名不縮寫', () => {
    expect(formatName('Madonna', { abbrev: true })).toBe('Madonna')
  })
})

describe('formatName — Latin abbreviation (abbrev=true)', () => {
  it('長英文：Christopher Wellington III → Christopher W.', () => {
    expect(formatName('Christopher Wellington III', { abbrev: true })).toBe(
      'Christopher W.'
    )
  })

  it('含敬稱：Dr. Christopher Lee → Christopher L.', () => {
    expect(formatName('Dr. Christopher Lee', { abbrev: true })).toBe(
      'Christopher L.'
    )
  })

  it('阿拉伯語系：Mohammed bin Abdulaziz Al-Saud → Mohammed A.', () => {
    expect(
      formatName('Mohammed bin Abdulaziz Al-Saud', { abbrev: true })
    ).toBe('Mohammed A.')
  })

  it('hyphenated last name: Sarah Chen-Matthews → Sarah C.', () => {
    expect(formatName('Sarah Chen-Matthews', { abbrev: true })).toBe('Sarah C.')
  })

  it('3 tokens triggers abbreviation', () => {
    expect(formatName('Mary Anne Smith', { abbrev: true })).toBe('Mary S.')
  })
})

describe('formatName — honorific stripping', () => {
  it('strips Mr.', () => {
    expect(formatName('Mr. John Doe')).toBe('John Doe')
  })

  it('strips Mrs.', () => {
    expect(formatName('Mrs. Jane Doe')).toBe('Jane Doe')
  })

  it('strips Ms.', () => {
    expect(formatName('Ms. Jane Doe')).toBe('Jane Doe')
  })

  it('strips Miss (no period)', () => {
    expect(formatName('Miss Jane Doe')).toBe('Jane Doe')
  })

  it('strips Prof.', () => {
    expect(formatName('Prof. Albert Einstein', { abbrev: true })).toBe(
      'Albert E.'
    )
  })

  it('stripHonorific=false keeps prefix', () => {
    expect(formatName('Dr. John Doe', { stripHonorific: false })).toBe(
      'Dr. John Doe'
    )
  })

  it('case-insensitive', () => {
    expect(formatName('dr. john doe')).toBe('john doe')
  })
})

describe('formatName — suffix stripping', () => {
  it('strips III', () => {
    expect(formatName('John Smith III')).toBe('John Smith')
  })

  it('strips Jr.', () => {
    expect(formatName('John Smith Jr.')).toBe('John Smith')
  })

  it('strips PhD', () => {
    expect(formatName('John Smith PhD')).toBe('John Smith')
  })

  it('suffix on short name: John Doe Jr. → John Doe (no abbrev)', () => {
    expect(formatName('John Doe Jr.', { abbrev: true })).toBe('John Doe')
  })
})

describe('formatName — clampLong hard cap', () => {
  it('22-char edge: not clamped', () => {
    const n = 'Alexandra Constantine' // 21 chars
    expect(formatName(n, { clampLong: true })).toBe('Alexandra Constantine')
  })

  it('>22 chars forces abbreviation even without abbrev flag', () => {
    const n = 'Alexandra Constantinople' // 24 chars
    expect(formatName(n, { clampLong: true })).toBe('Alexandra C.')
  })

  it('clampLong without abbrev still works on long names', () => {
    expect(
      formatName('Maximilian Sebastian Vandenberg', { clampLong: true })
    ).toBe('Maximilian V.')
  })
})

describe('formatName — default behavior (no options)', () => {
  it('default strips honorific but does not abbreviate', () => {
    expect(formatName('Dr. Christopher Lee')).toBe('Christopher Lee')
  })

  it('default returns full long name', () => {
    expect(formatName('Christopher Wellington III')).toBe(
      'Christopher Wellington'
    )
  })
})

describe('formatName — edge cases', () => {
  it('empty string', () => {
    expect(formatName('')).toBe('')
  })

  it('whitespace trimmed', () => {
    expect(formatName('  John Doe  ')).toBe('John Doe')
  })

  it('null-safe', () => {
    expect(formatName(null as unknown as string)).toBe('')
  })
})

describe('computeDefaultDisplayName', () => {
  it('CJK stays full', () => {
    expect(computeDefaultDisplayName('張文彥')).toBe('張文彥')
  })

  it('short Latin stays full', () => {
    expect(computeDefaultDisplayName('John Lee')).toBe('John Lee')
  })

  it('long Latin is abbreviated', () => {
    expect(computeDefaultDisplayName('Christopher Wellington')).toBe(
      'Christopher W.'
    )
  })

  it('honorific + long Latin: stripped + abbreviated', () => {
    expect(computeDefaultDisplayName('Dr. Christopher Lee')).toBe(
      'Christopher L.'
    )
  })
})
