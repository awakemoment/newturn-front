import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newturn - AI 투자 분석 메이트",
  description: "개인 투자자를 위한 AI 기업 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

