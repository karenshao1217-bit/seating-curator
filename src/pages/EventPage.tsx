import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEvent } from '../hooks/useEvent'
import { useCollaborator } from '../hooks/useCollaborator'
import { useResponsive } from '../hooks/useResponsive'
import { useTables } from '../hooks/useTables'
import CollaboratorModal from '../components/CollaboratorModal'
import SidePanel from '../components/SidePanel'
import MobileTabBar, { type MobileTab } from '../components/MobileTabBar'
import VenueCanvas from '../components/canvas/VenueCanvas'
import CanvasToolbar from '../components/canvas/CanvasToolbar'
import AddTableModal, { type AddTableData } from '../components/canvas/AddTableModal'
import PdfPageSelector from '../components/canvas/PdfPageSelector'
import SettingsPanel from '../components/settings/SettingsPanel'
import { getTableDisplaySize } from '../utils/generateSeats'
import { getPdfPageCount, renderPdfPage } from '../utils/pdfToImage'
import { uploadImageFile, uploadPdfBlob } from '../utils/uploadVenueImage'
import styles from './EventPage.module.css'

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { event, loading } = useEvent(eventId)
  const isDesktop = useResponsive()
  const [mobileTab, setMobileTab] = useState<MobileTab>('venue')
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [showAddTable, setShowAddTable] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const collaborator = useCollaborator(eventId, event, user?.uid)
  const { tables, addTable, updateTable, deleteTable } = useTables(eventId)

  const hasContent = tables.length > 0 || !!event?.venueImageUrl

  // --- Upload handlers ---
  const triggerFileInput = () => fileInputRef.current?.click()

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      console.log('[Upload] File selected:', file?.name, file?.type)
      if (!file || !eventId) return

      // Reset input so same file can be re-selected
      e.target.value = ''

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      console.log('[Upload] isPdf:', isPdf, 'eventId:', eventId)

      if (isPdf) {
        try {
          const count = await getPdfPageCount(file)
          if (count === 1) {
            // Single page PDF — render and upload directly
            setUploading(true)
            const { blob, width, height } = await renderPdfPage(file, 1)
            await uploadPdfBlob(eventId, blob, width, height)
            setUploading(false)
          } else {
            // Multi-page — show selector
            setPdfFile(file)
            setPdfPageCount(count)
          }
        } catch (err) {
          console.error('PDF processing failed:', err)
          alert('PDF 處理失敗，請重試')
          setUploading(false)
        }
      } else {
        // Image file
        console.log('[Upload] Starting image upload...')
        setUploading(true)
        try {
          const result = await uploadImageFile(eventId, file)
          console.log('[Upload] Image uploaded successfully:', result.url)
        } catch (err) {
          console.error('[Upload] Image upload failed:', err)
          alert('圖片上傳失敗，請重試')
        }
        setUploading(false)
      }
    },
    [eventId]
  )

  const handlePdfPageConfirm = useCallback(
    async (pageNum: number) => {
      if (!pdfFile || !eventId) return
      setPdfFile(null)
      setUploading(true)
      try {
        const { blob, width, height } = await renderPdfPage(pdfFile, pageNum)
        await uploadPdfBlob(eventId, blob, width, height)
      } catch (err) {
        console.error('PDF upload failed:', err)
        alert('PDF 上傳失敗，請重試')
      }
      setUploading(false)
    },
    [pdfFile, eventId]
  )

  // --- Table handlers ---
  const handleAddTables = useCallback(
    async (items: AddTableData[]) => {
      // Place at image center (if venue image exists), otherwise stage center
      const imgW = event?.venueImageWidth
      const imgH = event?.venueImageHeight
      const cx = imgW ? imgW / 2 : 400
      const cy = imgH ? imgH / 2 : 300
      const { w: displayW } = getTableDisplaySize(items[0].shape, items[0].widthCm, items[0].heightCm)
      const spacing = displayW + 30

      for (let i = 0; i < items.length; i++) {
        const offsetX = (i - (items.length - 1) / 2) * spacing
        await addTable({ ...items[i], x: Math.round(cx + offsetX), y: cy })
      }
    },
    [addTable, event]
  )

  const handleDragEnd = useCallback(
    (tableId: string, x: number, y: number) => {
      updateTable(tableId, { x, y })
    },
    [updateTable]
  )

  const handleRotate = useCallback(() => {
    if (!selectedTableId) return
    const table = tables.find((t) => t.id === selectedTableId)
    if (table) {
      updateTable(selectedTableId, { rotation: (table.rotation + 15) % 360 })
    }
  }, [selectedTableId, tables, updateTable])

  const handleDelete = useCallback(async () => {
    if (!selectedTableId) return
    const table = tables.find((t) => t.id === selectedTableId)
    if (!table) return
    if (!window.confirm(`確定要刪除桌子「${table.label}」嗎？`)) return
    await deleteTable(selectedTableId)
    setSelectedTableId(null)
  }, [selectedTableId, tables, deleteTable])

  // --- Hidden file input ---
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.png,.jpg,.jpeg"
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  )

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>載入中...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className={styles.loading}>
        <p>找不到此活動</p>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          返回首頁
        </button>
      </div>
    )
  }

  if (collaborator.needsModal && !collaborator.resolved) {
    return (
      <CollaboratorModal
        mode={event.collaborationMode as 'soft' | 'strict'}
        onConfirm={collaborator.setNickname}
        onSkip={collaborator.skip}
      />
    )
  }

  const canvasContent = uploading ? (
    <div className={styles.emptyCanvas}>
      <p className={styles.emptyTitle}>處理中...</p>
      <p className={styles.emptySubtitle}>正在上傳並處理檔案</p>
    </div>
  ) : hasContent ? (
    <>
      <CanvasToolbar
        selectedTableId={selectedTableId}
        onAddTable={() => setShowAddTable(true)}
        onRotate={handleRotate}
        onDelete={handleDelete}
        onUpload={triggerFileInput}
      />
      <VenueCanvas
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
        onDragEnd={handleDragEnd}
        containerRef={canvasContainerRef}
        venueImageUrl={event.venueImageUrl || undefined}
      />
    </>
  ) : (
    <div className={styles.emptyCanvas}>
      <svg className={styles.uploadIcon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 32l10-10 8 8 6-6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 4v8M20 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p className={styles.emptyTitle}>上傳場地平面圖開始排座位</p>
      <p className={styles.emptySubtitle}>支援 PDF、JPG、PNG</p>
      <button className={styles.uploadBtn} onClick={triggerFileInput}>
        上傳平面圖
      </button>
      <button
        className={styles.skipBtn}
        onClick={() => setShowAddTable(true)}
      >
        或直接新增桌子
      </button>
    </div>
  )

  const theme = event.theme ?? 'private'

  if (isDesktop) {
    return (
      <div className={styles.desktopLayout} data-theme={theme}>
        {fileInput}
        <header className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ←
          </button>
          <h1 className={styles.eventTitle}>{event.name}</h1>
          {collaborator.displayName && (
            <span className={styles.userName}>{collaborator.displayName}</span>
          )}
          <SettingsPanel eventId={eventId} currentTheme={theme} />
        </header>

        <div className={styles.desktopBody}>
          <main className={styles.canvasArea} ref={canvasContainerRef}>
            {canvasContent}
          </main>
          <SidePanel eventId={eventId} />
        </div>

        {showAddTable && (
          <AddTableModal
            onSubmit={handleAddTables}
            onClose={() => setShowAddTable(false)}
          />
        )}
        {pdfFile && (
          <PdfPageSelector
            file={pdfFile}
            pageCount={pdfPageCount}
            onConfirm={handlePdfPageConfirm}
            onClose={() => setPdfFile(null)}
          />
        )}
      </div>
    )
  }

  // Mobile layout
  return (
    <div className={styles.mobileLayout} data-theme={theme}>
      {fileInput}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ←
        </button>
        <h1 className={styles.eventTitle}>{event.name}</h1>
        {collaborator.displayName && (
          <span className={styles.userName}>{collaborator.displayName}</span>
        )}
        <SettingsPanel eventId={eventId} currentTheme={theme} />
      </header>

      <main className={styles.mobileContent} ref={!isDesktop ? canvasContainerRef : undefined}>
        {mobileTab === 'venue' && canvasContent}
        {mobileTab === 'guests' && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>還沒有賓客</p>
            <p className={styles.emptySubtitle}>可匯入 CSV 或手動新增</p>
            <button className={styles.emptyBtn}>新增賓客</button>
          </div>
        )}
        {mobileTab === 'export' && (
          <div className={styles.mobilePlaceholder}>
            匯出功能（Phase 7）
          </div>
        )}
      </main>

      <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />

      {showAddTable && (
        <AddTableModal
          onSubmit={handleAddTables}
          onClose={() => setShowAddTable(false)}
        />
      )}
      {pdfFile && (
        <PdfPageSelector
          file={pdfFile}
          pageCount={pdfPageCount}
          onConfirm={handlePdfPageConfirm}
          onClose={() => setPdfFile(null)}
        />
      )}
    </div>
  )
}
