import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContaPRO — Gestión de Gastos",
  description: "Dashboard web para facturas/boletas con IA y presupuesto",
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_HOST || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ContaPRO — Gestión de Gastos",
    description: "Dashboard web para facturas/boletas con IA y presupuesto",
    url: "/",
    siteName: "ContaPRO",
    images: [
      { url: "/logo.png", width: 1200, height: 630, alt: "ContaPRO" },
    ],
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContaPRO — Gestión de Gastos",
    description: "Dashboard web para facturas/boletas con IA y presupuesto",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Science+Gothic:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Stack+Sans+Text:wght@200..700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
