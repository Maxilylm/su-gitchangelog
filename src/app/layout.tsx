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
  title: "ChangelogAI — Git Log to Polished Changelog",
  description:
    "Paste your git log output and get a polished, grouped changelog in seconds. Powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
        {children}
              <script src="https://78slopads.vercel.app/api/promo.js" defer></script>
      </body>
    </html>
  );
}
