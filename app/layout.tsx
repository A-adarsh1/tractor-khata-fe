import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Suspense } from "react";
import { CopyrightYear } from "@/src/components/copyright-year";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Account Verification · Tractor Khata",
    template: "%s · Tractor Khata",
  },
  description: "Secure account verification portal for Tractor Khata.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/icon.png"
                height={36}
                width={36}
                alt=""
                priority
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="text-lg font-bold tracking-tight">
                Tractor Khata
              </span>
            </Link>

            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              Account Portal
            </span>
          </div>
        </header>

        {children}

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p>
              ©{" "}
              <Suspense fallback="2026">
                <CopyrightYear />
              </Suspense>{" "}
              Tractor Khata. All rights reserved.
            </p>
            <p>Secure Account Verification</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
