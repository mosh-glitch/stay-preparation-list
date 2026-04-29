import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '大城家 GW準備リスト',
  description: 'GW民泊お泊まり準備チェックリスト',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}