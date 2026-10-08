import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Meridian Press",
    default: "Meridian Press — Independent Digital Monograph Publishing House",
  },
  description:
    "An independent publishing house producing enduring digital monographs on software architecture, design philosophy, typography, and intellectual sovereignty.",
  keywords: [
    "digital publishing",
    "ebooks",
    "software architecture books",
    "design philosophy",
    "typography",
    "DRM-free books",
    "indie press",
  ],
  authors: [{ name: "Meridian Press Editorial Board" }],
  creator: "Meridian Press",
  metadataBase: new URL("https://meridianpress.pub"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meridianpress.pub",
    title: "Meridian Press — Independent Digital Monograph Publishing House",
    description:
      "Enduring digital monographs on systems architecture, design philosophy, and technical clarity. DRM-free, beautifully typeset.",
    siteName: "Meridian Press",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian Press",
    description: "Enduring digital monographs on systems architecture and intellectual craft.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jakarta.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#14161A] font-sans antialiased selection:bg-[#E8DCC4] selection:text-[#111215]">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
