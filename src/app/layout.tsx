import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";

const inter = Inter({
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
      { url: "/icono_carpeta_premium_hd.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/icono_carpeta_premium_hd.png",
    apple: "/icono_carpeta_premium_hd.png",
  },
  openGraph: {
    title: "ContaPRO — Gestión de Gastos",
    description: "Dashboard web para facturas/boletas con IA y presupuesto",
    url: "/",
    siteName: "ContaPRO",
    images: [
      { url: "/icono_carpeta_premium_hd.png", width: 1200, height: 630, alt: "ContaPRO" },
    ],
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContaPRO — Gestión de Gastos",
    description: "Dashboard web para facturas/boletas con IA y presupuesto",
    images: ["/icono_carpeta_premium_hd.png"],
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
        <link href="https://fonts.googleapis.com/css2?family=GFS+Didot&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icono_carpeta_premium_hd.png" sizes="any" type="image/png" />
        <link rel="shortcut icon" href="/icono_carpeta_premium_hd.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icono_carpeta_premium_hd.png" />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
