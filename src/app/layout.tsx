import type { Metadata } from "next";
import { Fredoka, Geist_Mono } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nomnomnow",
  description: "Can't decide what to eat? Tell us your mood, we'll pick the perfect spot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
