import styles from './CanvasToolbar.module.css'

interface Props {
  selectedTableId: string | null
  onAddTable: () => void
  onRotate: () => void
  onDelete: () => void
  onUpload?: () => void
}

export default function CanvasToolbar({
  selectedTableId,
  onAddTable,
  onRotate,
  onDelete,
  onUpload,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.btn} onClick={onAddTable}>
        ＋ 新增桌子
      </button>
      {onUpload && (
        <>
          <div className={styles.divider} />
          <button className={styles.btn} onClick={onUpload} title="上傳底圖">
            ⬆ 底圖
          </button>
        </>
      )}
      {selectedTableId && (
        <>
          <div className={styles.divider} />
          <button className={styles.btn} onClick={onRotate} title="旋轉 +15°">
            ↻ 旋轉
          </button>
          <button
            className={`${styles.btn} ${styles.deleteBtn}`}
            onClick={onDelete}
            title="刪除桌子"
          >
            ✕ 刪除
          </button>
        </>
      )}
    </div>
  )
}
