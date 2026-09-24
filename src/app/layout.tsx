import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "FinançaApp",
  description: "Controle financeiro familiar e de freelancer",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finanças",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-foreground pb-16">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <BottomBar />
      </body>
    </html>
  );
}

