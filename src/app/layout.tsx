import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display, Permanent_Marker, Montserrat } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
      { url: "/logo3dNUEVO.ico", sizes: "any" },
    ],
    shortcut: "/logo3dNUEVO.ico",
    apple: "/logo3dNUEVO.ico",
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
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${playfair.variable} ${permanentMarker.variable} ${montserrat.variable} antialiased`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
