# Seating Curator — Design Handoff Notes

Phase 5 · 交給 Claude Code 實作用

---

## 1. 範圍與交付物

這份 notes 對應 `Seating Curator Phase 5 v2.html`（或 standalone 版）中的 **11 個 artboards，5 個 sections**：

| Section | Artboards | 說明 |
|---|---|---|
| 1. 座位標記 · 總覽 | 私人 / 商業 | 一頁顯示全部桌次，每桌 rim 外顯示賓客名字 |
| 2. 座位標記 · 細節 | 私人主桌 / 商業主桌（外國全名） / 商業衝突桌 | 放大單桌＋下方完整賓客列表 |
| 3. 桌旁列表 · 總覽 | 私人 / 商業 | 每桌旁附編號列表（1–N），桌面只保留桌號與座號 |
| 4. 桌旁列表 · 細節 | 私人主桌 / 商業衝突桌 | Side-mode 的單桌放大版 |
| 5. 衝突狀態 · 總覽 | 私人 / 商業 | 示範衝突視覺語言在總覽情境下的樣子 |

兩個主題（`data-direction="A"` 低調專業、`data-direction="C"` 溫暖場域）對所有 artboards 都生效。Direction B（現代清爽）存在於 `tokens.css` 但 Phase 5 未使用，可選擇保留或移除。

---

## 2. 設計系統

### 2.1 Tokens 架構

所有 design tokens 定義在 `tokens.css`，用 `[data-direction="A|B|C"]` 屬性切換 scope。實作時請完整保留這個結構——主題切換是改父層 `data-direction`，不是重載 stylesheet。

**共用 tokens（`:root`）**：
- `--radius-xs|sm|md|lg`：2 / 4 / 6 / 10 px
- `--space-1..12`：4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 px

**每個 direction 定義**：
- `--font-zh` / `--font-en` / `--font-mono`：字型堆疊
- `--fs-micro..display`：字級 ramp（direction A 為標準：10 / 11 / 14 / 15 / 18 / 24 / 32 / 44）
- `--bg-canvas / bg-surface / bg-sunken / bg-hover`：4 層背景
- `--ink-1|2|3`：3 層文字
- `--line-1|2|3`：3 層線條
- `--accent / accent-soft`：主色
- `--vip`：VIP 金色
- `--must`：必坐一起（綠色語意）
- `--avoid`：衝突／避免（紅色語意）
- `--shadow-sm|md`

### 2.2 兩個 Direction 的色彩特徵

| Token | A · 低調專業 | C · 溫暖場域 |
|---|---|---|
| bg-canvas | `#f4efe6` 米白 | `#ede3d2` 暖沙 |
| bg-surface | `#fbf7ef` 奶油 | `#f6eedd` 深米 |
| ink-1 | `#1a1916` 黑墨 | `#2a2419` 咖啡墨 |
| accent | `#1a1916` 黑 | `#4a5132` 暗橄欖 |
| vip | `#8a6b2e` 古金 | `#a87f3c` 暖金 |
| avoid | `#8a2a2a` 牛血紅 | `#7a2b2b` 酒紅 |
| font-zh | Noto Serif TC | Noto Serif TC |
| font-en | Cormorant Garamond | IBM Plex Serif |

兩個主題都用襯線字（刻意——宴會規劃需要一點古典感）。差異在 Direction C 的英文字是 IBM Plex Serif（幾何感較強的襯線），底色偏暖。

### 2.3 字型載入

GitHub repo 應預先 `@import` 或 `<link>` 這些 Google Fonts：
- Noto Serif TC（400/600/700）
- Noto Sans TC（400/500/600）
- Cormorant Garamond（400/500/600）
- IBM Plex Serif（400/500/600）
- Inter（400/500/600）（Direction B 用，可選）

### 2.4 共用樣式規則

- Border radius 普遍偏小（2–6px），整體偏「紙本感」而非「SaaS 感」
- 所有 pill / chip 都是 `border-radius: 2px` 或 `4px`，**不用** `999px` 全圓
- Hover 不加 shadow，只換 `--bg-hover`
- 英文 label 一律 `text-transform: uppercase; letter-spacing: 0.14–0.18em`
- Section headers 用 `font-en` + `uppercase` 作為 micro-label，下方接中文標題

---

## 3. 元件規則

### 3.1 `TableCard`（`board-seating-p5.jsx`）

核心元件，所有 5 個 sections 都用它，透過 `mode` prop 切換顯示模式：

| mode | 說明 |
|---|---|
| `seat` | 名字顯示在座位圓形周圍（sector 座位標記模式） |
| `side` | 名字顯示在桌子旁邊的編號列表（1–N） |

其他關鍵 props：
- `scale`：總覽 = 1；細節 = 1.3
- `abbrev`：總覽 = true；細節 = false
- `conflict`：該桌是否有衝突（觸發紅色視覺）
- `selected`：被選中的桌子（加粗邊線）

**座號 1–N**（桌面上的小數字）：**兩個 mode 都顯示**。這是 Phase 5 晚期修正的規則——原本只在 seat-mode 顯示，但老闆在 side-mode 看旁邊列表「3. 許慶雄」時也需要能在桌上對應到 3 號位的實際方位。

### 3.2 `formatName`（核心名字格式化函式）

位置：`board-seating-p5.jsx` 最上方。統一處理：
1. **Honorific stripping**：Dr./Mr./Mrs./Ms./Miss/Prof./Rev./Sir/Lord/Lady/Hon./Capt./Col./Gen. 前綴移除。敬稱保留在資料層（名片印刷用），UI 不顯示。
2. **Suffix stripping**：Jr./Sr./III/PhD/MD 等後綴移除（用於判斷 token 數，但不一定顯示縮寫）。
3. **CJK 判斷**：中日韓名字永遠不縮寫，原樣輸出。
4. **Latin 縮寫**（`abbrev=true`）：名字 >11 字或 3+ tokens → `Firstname L.`
5. **Hard cap**（`clampLong=true`，只在桌面座位標籤 call）：Latin 名字 >22 字強制縮寫，避免溢出版面。hyphenated last name（Al-Saud, Chen-Matthews）取連字前第一字母。

**重要**：`clampLong` 必須只在桌面座位標籤 call site 使用。其他地方（detail list、side list、badges）都顯示完整 stripped 全名。這是刻意的 trade-off：桌面受版面限制所以縮寫；列表有空間所以顯示完整資訊。

### 3.3 衝突視覺語言（三層，不重複）

嚴格按這個層次走，不要重複標示：

| 層級 | 視覺 | 用途 |
|---|---|---|
| 桌層級 | 桌子邊線變紅（`var(--avoid)`，1.6px） | 一眼看到哪桌有問題 |
| 桌旁列表的列表框 | 整個列表框邊線變紅 | side-mode 下對應桌的定位 |
| 人層級 | 整行反紅底（`color-mix(in srgb, var(--avoid) 10%, transparent)`）＋粗體紅全形驚嘆號 `！` | 快速定位是誰 |
| 資訊層級 | 底部狀態列「衝突 N」計數 | 總數資訊 |

**不要**加：
- 「衝突」紅色徽章（角落或桌號旁的 pill）
- 人名字色變紅（VIP 在衝突桌要維持金色 `--vip`）
- 三角形警告符號 ⚠（改用粗體 `！`）

### 3.4 VIP 視覺

- 字色 `var(--vip)`（Direction A 古金 / Direction C 暖金）
- 字重 600 或 700
- VIP 位於衝突桌時，**保留金色**——衝突用背景色表達，不搶字色

### 3.5 Notes / Chips

`NoteChip` 元件顯示「排位備註」（constraint/decision info only）：
- `avoid` → 紅色
- `must` → 綠色（`--must`）
- `social` → 次文字色（`--ink-2`）
- `timing` → 次文字色

這些 chip 是資訊層，**不是**衝突警示層——有 `avoid` 備註不代表該桌有衝突，衝突是兩個賓客同桌時才觸發。

---

## 4. 兩個主題的切換機制

實作時：

```html
<html data-direction="A">
  <!-- ... -->
</html>
```

或包在特定 container：

```html
<div data-direction="C">
  <!-- 整個 app -->
</div>
```

切換只需改這個屬性，所有 CSS custom properties 自動更新。**不要**用 JS 重載 stylesheet，也**不要**用 class（如 `.theme-a`）——一律 `data-direction`，這是 tokens.css 的既定 scope。

主題切換應提供 UI 控制項（Phase 5 prototype 中在 design canvas 的 artboard 層級）。實作時建議：
- 設定頁 toggle
- 儲存在 `localStorage` 或使用者 profile
- 可選：跟隨作業系統 light/dark 偏好（但目前兩個 direction 都是 light，未定義 dark variant）

---

## 5. 關鍵互動邏輯

### 5.1 模式切換（seat ↔ side）

- 工具列上獨立控制項，使用者偏好（iPad 情境下可能根據老闆習慣不同）
- 同一份資料，`TableCard` 用 `mode` prop 切換顯示
- 儲存在 `localStorage`（重新整理保留上次選擇）

### 5.2 總覽 ↔ 細節

- 總覽（`scale=1, abbrev=true`）：所有桌一頁顯示
- 點桌 → 細節（`scale=1.3, abbrev=false`）：單桌放大＋下方完整列表
- 細節模式下，原本的總覽淡化或隱藏（目前 prototype 是並列顯示給設計評估用；實作時應為單一視圖切換）
- 返回鈕回總覽

### 5.3 換位（Swap）

Prototype 中只示範 UI（每列最右「換位」按鈕），未實作互動。實作規格建議：
1. 點「換位」→ 進入 swap mode
2. 目標賓客框起來，所有其他座位變可點狀態
3. 點目標座位 → 執行交換（兩人互換）
4. 若目標座位為空 → 執行移動
5. 換位完成後重新計算衝突（詳見 5.4）

### 5.4 衝突偵測

Prototype 中衝突是 hardcoded（`initialConflict`, `conflictGuestIds = ['g11', 'g13']`）。實作時應：
- 賓客資料有 `avoid: <id>` tag（對應要避免同桌的另一位賓客 id）
- 每次換位後，遍歷每桌賓客，若有兩人互列 avoid → 標記該桌 `conflict=true`，兩人 id 加入 `conflictGuestIds`
- 衝突更新觸發 UI 重繪（桌邊紅框、列表反紅底等）

### 5.5 語音輸入（Voice）

Prototype 右下有大型麥克風按鈕（最顯眼控制項）。這是 Phase 5 的核心互動假設：**老闆口語換位**（「把李先生移到主桌」），而不是拖曳。

實作時需：
- 語音轉文字
- NLU 解析：誰、動作、目標
- 預覽確認（螢幕顯示「將李先生 從 桌 3 → 主桌」，按確認執行）
- 執行後觸發衝突重算（5.4）

**這是整個產品的核心差異化**，實作優先度最高。

---

## 6. 已知實作階段待處理事項

### 6.1 下半圈姓名對齊（⚠️ 原型階段未完全解決）

**問題**：圓桌下半圈的座位名字（座位 4、5、6 在 8 人桌的情境下），視覺上仍比上半圈略微遠離桌緣，三輪修正後有改善但未完全對稱。

**原型階段做過的嘗試**：
1. 用 DOM + `transform: translate(-50%+cos*50%, -50%+sin*50%)` 取代 SVG text（改善文字渲染）
2. 加 `line-height: 1` 壓縮 bounding box ascent/descent（改善但仍有 sub-pixel 差異）
3. 改 `nameGap` 固定值

**實作時建議解法**：
- 用極座標精準計算：每個字的視覺中心應落在 `(cx + cos(a) * (r + nameGap + nameHeight/2), cy + sin(a) * (r + nameGap + nameHeight/2))`
- `nameHeight` 不能假設，需用 `getBoundingClientRect` 量測每個 name element 的實際高度
- 可能需要先 render 一次（不可見）量測、再正式 render
- 或用 Canvas `measureText` 在 render 前計算
- 另一條路：改用 SVG `<text>` + `dominant-baseline="central"` + `text-anchor` 組合，但會犧牲一些 DOM 文字的渲染品質

這是一個**純技術實作問題**，不是設計問題——設計規則已經定了（每個名字的近桌邊 bounding box edge 等距），差在 DOM 實作精度。

### 6.2 語音輸入（核心功能未實作）

見 5.5。Prototype 只是示範按鈕位置與大小，實際的 speech-to-text、NLU、confirmation flow 都需要從零做起。

### 6.3 長名字處理（已有方案，實作時遵循）

Hard cap 已在 `formatName` 實作。實作時注意：
- `clampLong` 只能在桌面座位標籤 call
- 其他地方顯示完整 stripped 名字
- 如果長名字仍溢出（比方 22 字以內但字型較寬），考慮再降 hard cap 到 18

### 6.4 衝突偵測的即時性

Prototype 是 hardcoded 衝突。實作時：
- 換位後同步重算（不應有 loading state）
- 衝突清單變動應用 animated transition（紅框淡入）而非 hard swap

### 6.5 桌旁列表的 overflow

如果某桌有 >12 位賓客，side-mode 的列表會超出 artboard 高度。Prototype 未處理此情境。實作時建議：
- 列表捲動或
- 自動切換該桌為 seat-mode 顯示（因列表太長失去「一眼對照」的價值）

### 6.6 Direction B 是否保留

`tokens.css` 有 Direction B（現代清爽）定義但 Phase 5 未使用。產品決策：
- 保留 → 未來如果做 admin/data view 可能適用
- 移除 → 減少 token 維護成本

建議先保留，產品 launch 後評估是否用到。

### 6.7 Dark mode

目前兩個 direction 都是 light。如需 dark variant：
- 新增 `[data-direction="A"][data-theme="dark"]` 覆寫
- 避免另開 `--bg-canvas-dark` 這類 token，一律透過 scope 覆寫

---

## 7. 檔案對應表

Prototype 檔案結構（實作時可參考拆分方式）：

| 檔案 | 內容 |
|---|---|
| `tokens.css` | 所有 design tokens，`[data-direction]` scope |
| `theme-a.css` | 應用層 CSS（可合併入 tokens.css 或拆成 global styles） |
| `atoms.jsx` | 基礎元件（button, pill, chip 等） |
| `board-seating-p5.jsx` | 主要元件：`TableCard`, `SeatingP5`, `formatName`, `NoteChip`, `StatPill` |
| `data.jsx` | mock 賓客資料（實作時改為 API） |
| `ipad-frame.jsx` | iPad 裝置框（示意用，實作時不需要） |
| `design-canvas.jsx` | 原型的多 artboard 比較工具，實作時不需要 |

---

## 8. 最終檢查清單

實作 Phase 5 前，驗收下列視覺規則：

- [ ] 切換 `data-direction="A"` ↔ `"C"`，所有顏色、字型、字級正確更新
- [ ] 座位標記模式：桌面顯示桌號 + 座號 1-N，名字在桌邊
- [ ] 桌旁列表模式：桌面顯示桌號 + 座號 1-N（**與 seat-mode 相同**），名字在旁邊編號列表
- [ ] 總覽模式：長英文名縮寫為 `Firstname L.`
- [ ] 細節模式：名字顯示完整（但 >22 字的極長名仍在桌面縮寫）
- [ ] 詳細列表（detail row）：無論名字多長都顯示完整
- [ ] 敬稱（Dr./Mr. 等）在任何 UI 都不顯示
- [ ] VIP 字色金色，在衝突桌**不**變紅
- [ ] 衝突桌：邊線紅（seat-mode）＋ 列表框邊線紅（side-mode）
- [ ] 衝突賓客行：反紅底＋粗體紅 `！`，但字色維持原本的金/黑
- [ ] **無**「衝突」紅色徽章，**無** ⚠ 三角符號
- [ ] 底部狀態列「衝突 N」計數正常
- [ ] 下半圈姓名對齊（技術實作精度，見 6.1）

---

*文件對應版本：Seating Curator Phase 5 v2*
