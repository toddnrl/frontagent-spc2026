import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Front Agent · AI 고객 응대 & 예약 자동화',
  description: 'AI 고객 응대 & 예약 자동화 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
