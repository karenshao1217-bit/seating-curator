import { useState, useEffect } from 'react'
import { renderPdfThumbnail } from '../../utils/pdfToImage'
import styles from './PdfPageSelector.module.css'

interface Props {
  file: File
  pageCount: number
  onConfirm: (pageNum: number) => void
  onClose: () => void
}

export default function PdfPageSelector({
  file,
  pageCount,
  onConfirm,
  onClose,
}: Props) {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadThumbnails() {
      const results: string[] = []
      for (let i = 1; i <= pageCount; i++) {
        if (cancelled) return
        const dataUrl = await renderPdfThumbnail(file, i)
        results.push(dataUrl)
        if (!cancelled) setThumbnails([...results])
      }
      if (!cancelled) setLoading(false)
    }

    loadThumbnails()
    return () => {
      cancelled = true
    }
  }, [file, pageCount])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>請選擇場地平面圖的頁面</h2>

        <div className={styles.scrollContainer}>
          {thumbnails.map((thumb, i) => (
            <button
              key={i}
              className={`${styles.thumbBtn} ${selected === i + 1 ? styles.selected : ''}`}
              onClick={() => setSelected(i + 1)}
            >
              <img src={thumb} alt={`第 ${i + 1} 頁`} className={styles.thumbImg} />
              <span className={styles.pageNum}>第 {i + 1} 頁</span>
            </button>
          ))}
          {loading && (
            <div className={styles.loadingThumb}>
              <span>載入中...</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.confirmBtn}
            disabled={selected === null}
            onClick={() => selected && onConfirm(selected)}
          >
            確認
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
