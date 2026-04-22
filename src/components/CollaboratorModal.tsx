import { useState } from 'react'
import styles from './CollaboratorModal.module.css'

interface Props {
  mode: 'soft' | 'strict'
  onConfirm: (nickname: string) => void
  onSkip: () => void
}

export default function CollaboratorModal({ mode, onConfirm, onSkip }: Props) {
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim()) {
      onConfirm(nickname.trim())
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>請輸入您的暱稱</h2>
        <p className={styles.desc}>
          {mode === 'strict'
            ? '此活動要求所有協作者填寫暱稱'
            : '填寫暱稱方便其他協作者辨識您'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="您的暱稱"
            className={styles.input}
            autoFocus
          />

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={!nickname.trim()}
            >
              確認
            </button>
            {mode === 'soft' && (
              <button
                type="button"
                className={styles.skipBtn}
                onClick={onSkip}
              >
                略過
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
