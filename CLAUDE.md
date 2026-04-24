# Seating Curator — CLAUDE.md

## ⚠️ 實作規則（必讀）

**未來所有功能實作、UI 調整、互動行為，都必須遵循 `docs/Seating Curator _ Design Handoff Notes.md` 的設計規格。** 動手寫任何程式碼前，請先閱讀該文件並確認設計決策一致。若設計文件與本檔案的敘述有出入，以設計文件為準。

## 專案概述

給活動 PM 使用的桌位管理工具。PM 拿到場地平面圖（PDF 或圖片）、桌子款式與尺寸、賓客名單，需要在平面圖上排桌次與座位號碼，把賓客指派到座位，並在最後匯出可列印的 PDF。支援多人即時共同編輯，並保留修改歷程。

## 技術棧

- **Frontend**: React + TypeScript + Vite
- **Canvas 互動**: react-konva（Konva.js 的 React wrapper）
- **PDF 解析**: PDF.js（pdfjs-dist）
- **即時同步**: Firebase Firestore（onSnapshot）
- **身分識別**: Firebase 匿名驗證（Anonymous Auth）
- **檔案儲存**: Firebase Storage
- **匯出**: html2canvas + jsPDF
- **部署**: Vercel

## 資料結構（Firestore）

events/{eventId}
├── name: string
├── createdAt: timestamp
├── createdBy: string
├── venueImageUrl: string
├── venueImageWidth: number
├── venueImageHeight: number
├── collaborationMode: 'open' | 'soft' | 'strict'
│
├── sessions/{sessionId}
│   ├── name: string
│   ├── tables/{tableId}
│   │   ├── shape: 'round' | 'rect' | 'long'
│   │   ├── label: string
│   │   ├── x: number
│   │   ├── y: number
│   │   ├── rotation: number
│   │   ├── widthCm: number
│   │   ├── heightCm: number
│   │   ├── capacity: number
│   │   └── seats/{seatId}
│   │       ├── label: string
│   │       ├── relX: number
│   │       ├── relY: number
│   │       └── guestId: string | null
│   └── guestAssignments/{guestId}
│       └── seatId: string | null
│
├── guests/{guestId}
│   ├── name: string
│   ├── company: string
│   ├── unit: string
│   ├── meal: { type, restrictions, notes }
│   └── tags: string[]
│
└── changelog/{changeId}
    ├── userId: string
    ├── userName: string
    ├── timestamp: timestamp
    ├── action: 'ASSIGN' | 'UNASSIGN' | 'MOVE_TABLE' | 'ADD_NOTE' | 'ADD_GUEST' | 'ADD_TABLE'
    ├── targetLabel: string
    ├── before: object
    └── after: object

## 尺寸換算常數

const PDF_RENDER_WIDTH = 3500
const CANVAS_SCALE = 0.2
const CM_TO_PX = 10

const PAPER_SIZES = {
  A4_portrait:  { w: 210, h: 297 },
  A4_landscape: { w: 297, h: 210 },
  A3_portrait:  { w: 297, h: 420 },
  A3_landscape: { w: 420, h: 297 },
}

## 協作識別邏輯

進入活動時檢查 localStorage，依 collaborationMode 決定是否詢問暱稱：
- open：直接進入，不詢問
- soft：跳出 bottom sheet，可略過
- strict：必填暱稱才能進入
暱稱存在 localStorage key = collaborator_{eventId}

## 未來擴充預留點

- sessions/ 多場次：目前只建立 default session
- generateSeats(tableConfig) 包成獨立 utility
- Firebase Auth 未來可升級為 email/Google 登入

## 開發順序

1. 基礎框架：Vite + React + TypeScript + Firebase + 路由
2. 場地編輯器：Konva canvas + 三種桌型
3. PDF/圖片底圖上傳
4. 賓客管理
5. 座位指派
6. 即時協作 + changelog
7. 列印/匯出
