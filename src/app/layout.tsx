import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOAT Debate | Kobe vs LeBron",
  description:
    "科比 vs 詹姆斯——12 个最热争议话题，选边站，逐轮 PK，你来决定谁是 GOAT。",
  openGraph: {
    title: "GOAT Debate | Kobe vs LeBron",
    description: "12 个最热争议话题，选边站 PK，谁才是真正的 GOAT？",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
