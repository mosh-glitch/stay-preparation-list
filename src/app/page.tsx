# GW準備チェックリスト — Next.js プロジェクト

## ファイル構成

```
gw-checklist/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          ← メインアプリ（全ロジック）
│   └── globals.css
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 各ファイルの内容

---

### package.json

```json
{
  "name": "gw-checklist",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

---

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### tailwind.config.js（新規作成）

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

---

### postcss.config.js（新規作成）

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

---

### app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { background: #f5f4f0; font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif; }
```

---

### app/layout.tsx

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '大城家 GW準備リスト',
  description: 'GW民泊お泊まり準備チェックリスト',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

---

### app/page.tsx　← ★ メインファイル

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

/* ───────── 型定義 ───────── */
type Item = { id: string; label: string; checked: boolean }
type State = Record<string, Item[]>

/* ───────── カテゴリ定義 ───────── */
const CATS = [
  { id: 'ent',   name: 'エンタメ・遊び',       icon: '🎮', bg: '#ede9fe' },
  { id: 'hyg',   name: '衛生・アメニティ・薬', icon: '🧴', bg: '#fce7f3' },
  { id: 'kitch', name: 'キッチン・消耗品',      icon: '🍳', bg: '#fef3c7' },
  { id: 'cloth', name: '衣類',                 icon: '👕', bg: '#dbeafe' },
]

/* ───────── プリセットデータ ───────── */
const DEFAULT: State = {
  ent: [
    'レンタルDVD',
    '水鉄砲セット ＆ 水風船セット',
    'ホットプレート ＆ 延長コード',
    'スマホ/タブレット（ビンゴアプリ用）＆ 充電器 ＆ モバイルバッテリー',
    '室内遊び道具（トランプ等）',
  ].map((label, i) => ({ id: `ent_${i}`, label, checked: false })),

  hyg: [
    '外遊び用ハンドタオル（3枚程度）',
    '歯ブラシ・歯磨き粉（家族全員分）',
    '髭剃り・シェービングフォーム',
    '日焼け止め',
    '厚手のウェットティッシュ',
    '酔い止め薬 ＆ 絆創膏',
  ].map((label, i) => ({ id: `hyg_${i}`, label, checked: false })),

  kitch: [
    '強力蚊取り線香 ＆ ライター',
    '調味料セット（油・塩コショウ・タレ）',
    'ジップロック ＆ アルミホイル',
    'エチケット袋 ＆ ゴミ袋予備',
  ].map((label, i) => ({ id: `kitch_${i}`, label, checked: false })),

  cloth: [
    '2日目の服 ＆ 下着・靴下（予備多め）',
    'パジャマ ＆ 羽織もの ＆ 水着・ラッシュガード ＆ サンダル',
  ].map((label, i) => ({ id: `cloth_${i}`, label, checked: false })),
}

const STORAGE_KEY = 'gw_checklist_v1'

/* ───────── メインコンポーネント ───────── */
export default function Page() {
  const [state, setState] = useState<State>(DEFAULT)
  const [filter, setFilter] = useState<string>('all')
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    ent: true, hyg: true, kitch: true, cloth: true,
  })
  const [addLabel, setAddLabel] = useState('')
  const [addCat, setAddCat] = useState('ent')
  const [hydrated, setHydrated] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* 初期ロード */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  /* 保存 */
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  /* 統計 */
  const stats = () => {
    let total = 0, done = 0
    CATS.forEach(c => { (state[c.id] ?? []).forEach(i => { total++; if (i.checked) done++ }) })
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 }
  }
  const { total, done, pct } = stats()

  /* トグル */
  const toggle = (catId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      [catId]: prev[catId].map(i => i.id === itemId ? { ...i, checked: !i.checked } : i),
    }))
  }

  /* アイテム追加 */
  const addItem = () => {
    const label = addLabel.trim()
    if (!label) return
    setState(prev => ({
      ...prev,
      [addCat]: [...(prev[addCat] ?? []), { id: `${addCat}_${Date.now()}`, label, checked: false }],
    }))
    setAddLabel('')
  }

  /* リセット */
  const resetAll = () => {
    if (!confirm('全てのチェックをリセットしますか？')) return
    setState(prev => {
      const next: State = {}
      CATS.forEach(c => { next[c.id] = (prev[c.id] ?? []).map(i => ({ ...i, checked: false })) })
      return next
    })
  }

  /* エクスポート */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gw_checklist_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* インポート */
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (typeof parsed === 'object' && parsed !== null) {
          setState(parsed)
          alert('インポート完了！')
        } else {
          alert('無効なファイルです')
        }
      } catch { alert('読み込みに失敗しました') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (!hydrated) return null

  /* フィルタ済みアイテム */
  const filteredItems = (catId: string): Item[] => {
    const items = state[catId] ?? []
    if (filter === 'done') return items.filter(i => i.checked)
    if (filter === 'undone') return items.filter(i => !i.checked)
    return items
  }

  const progressMsg = pct === 100 ? '🎉 準備完了！' : pct >= 75 ? 'もうすぐ完了！' : pct >= 50 ? '半分来たよ！' : pct >= 25 ? 'いいスタート！' : 'さあ、準備を始めよう！'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 60px' }}>

      {/* ヘッダー */}
      <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
        <div style={{ fontSize: 36 }}>🏖️</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginTop: 8 }}>大城家 GW準備リスト</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>民泊お泊まり — 友人家族と</p>
      </div>

      {/* 進捗カード */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>準備の進捗</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
            {done} <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>/ {total}</span>
          </span>
        </div>
        <div style={{ background: '#f0ede8', borderRadius: 100, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#6C63FF,#a78bfa)', width: `${pct}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' }}>{progressMsg}</div>
      </div>

      {/* バックアップバー */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={exportJSON} style={backupBtn('🟢')}>⬇ エクスポート</button>
        <button onClick={() => fileRef.current?.click()} style={backupBtn('🔵')}>⬆ インポート</button>
        <input ref={fileRef} type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
      </div>

      {/* フィルターバー */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {[{ id: 'all', label: 'すべて' }, { id: 'undone', label: '未チェック' }, { id: 'done', label: '完了済み' },
          ...CATS.map(c => ({ id: c.id, label: `${c.icon} ${c.name}` }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={filterBtn(filter === f.id)}>{f.label}</button>
        ))}
      </div>

      {/* カテゴリ一覧 */}
      {CATS.filter(c => filter === 'all' || filter === c.id || filter === 'undone' || filter === 'done').map(cat => {
        const items = filteredItems(cat.id)
        const catDone = (state[cat.id] ?? []).filter(i => i.checked).length
        const catTotal = (state[cat.id] ?? []).length
        const allDone = catTotal > 0 && catDone === catTotal
        const isOpen = openCats[cat.id]
        return (
          <div key={cat.id} style={{ ...card, marginBottom: 12, padding: 0, overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}
              onClick={() => setOpenCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}
            >
              <div style={{ width: 30, height: 30, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>{catDone}/{catTotal} 完了</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: allDone ? '#d1fae5' : catDone > 0 ? '#ede9fe' : '#f3f4f6', color: allDone ? '#065f46' : catDone > 0 ? '#5b21b6' : '#9ca3af' }}>{catDone}/{catTotal}</span>
              <span style={{ fontSize: 11, color: '#ccc', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.length === 0
                  ? <div style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '10px 0' }}>アイテムがありません</div>
                  : items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggle(cat.id, item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#fafaf8', borderRadius: 12, cursor: 'pointer', opacity: item.checked ? 0.55 : 1 }}
                    >
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: item.checked ? 'none' : '2px solid #d8d5d0', background: item.checked ? '#6C63FF' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {item.checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize: 14, color: '#333', textDecoration: item.checked ? 'line-through' : 'none', flex: 1 }}>{item.label}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )
      })}

      {/* アイテム追加 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <select value={addCat} onChange={e => setAddCat(e.target.value)} style={selectStyle}>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input
          value={addLabel}
          onChange={e => setAddLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="アイテムを追加…"
          style={inputStyle}
        />
        <button onClick={addItem} style={{ width: 44, height: 44, borderRadius: '50%', background: '#6C63FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* リセット */}
      <button onClick={resetAll} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 14, border: '1.5px solid #e5e2dd', background: '#fff', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
        チェックをリセット
      </button>
    </div>
  )
}

/* ───────── スタイル定数 ───────── */
const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}
const filterBtn = (active: boolean): React.CSSProperties => ({
  flexShrink: 0,
  padding: '6px 14px',
  borderRadius: 100,
  border: `1.5px solid ${active ? '#6C63FF' : '#e5e2dd'}`,
  background: active ? '#6C63FF' : '#fff',
  color: active ? '#fff' : '#666',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
})
const backupBtn = (_: string): React.CSSProperties => ({
  flex: 1,
  padding: '10px 0',
  borderRadius: 14,
  border: '1.5px solid #e5e2dd',
  background: '#fff',
  fontSize: 13,
  color: '#555',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 500,
})
const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: 14,
  border: '1.5px solid #e5e2dd',
  background: '#fff',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1a1a1a',
  outline: 'none',
}
const selectStyle: React.CSSProperties = {
  padding: '12px 10px',
  borderRadius: 14,
  border: '1.5px solid #e5e2dd',
  background: '#fff',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#555',
  outline: 'none',
}
```