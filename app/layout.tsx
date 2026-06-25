import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Front Agent",
  description: "고객 문의 응대와 예약 관리를 자동화하는 AI 운영 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
