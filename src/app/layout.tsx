import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FinançaApp",
  description: "Controle financeiro familiar e de freelancer",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
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
      <body className="min-h-full flex flex-col bg-background text-foreground pb-16">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <BottomBar />
      </body>
    </html>
  );
}

