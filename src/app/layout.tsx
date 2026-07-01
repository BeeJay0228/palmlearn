import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PalmLearn | Enterprise Learning Platform",
    template: "%s | PalmLearn",
  },
  description:
    "PalmLearn empowers organizations to create, deliver, and track learning experiences at scale. Built for PalmPay.",
  keywords: [
    "LMS",
    "learning management system",
    "enterprise learning",
    "PalmPay",
    "corporate training",
  ],
  openGraph: {
    title: "PalmLearn | Enterprise Learning Platform",
    description:
      "Empower your workforce with a premium learning experience.",
    type: "website",
    siteName: "PalmLearn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
