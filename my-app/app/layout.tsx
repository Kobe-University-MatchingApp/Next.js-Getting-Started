import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< Updated upstream
import BottomNav from "./components/BottomNav";
=======
import BottomNav from "./_components/BottomNav";
import { ModalProvider } from "./_contexts/ModalContext";
import { UserProvider } from "./_contexts/UserContext";
>>>>>>> Stashed changes

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "イベント管理アプリ",
  description: "イベントを作成・検索・管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mobile-layout`}
      >
<<<<<<< Updated upstream
        <div className="mobile-container">
          <main className="main-content pb-16">
            {children}
          </main>
          <BottomNav />
        </div>
=======
        <UserProvider>
          <ModalProvider>
            <div className="mobile-container">
              <main className="main-content pb-16">
                {children}
              </main>
              <BottomNav />
            </div>
          </ModalProvider>
        </UserProvider>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
