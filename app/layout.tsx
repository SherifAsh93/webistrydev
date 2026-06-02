import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Webistrydev — Full-Stack Web Developer",
  description:
    "I build fast, elegant websites and web applications for businesses worldwide. E-commerce, brand sites, clinic apps, and custom web platforms.",
  keywords: ["web developer", "freelance", "Next.js", "React", "full-stack", "e-commerce"],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Webistrydev" },
  openGraph: {
    title: "Webistrydev — Full-Stack Web Developer",
    description: "I build fast, elegant websites and web applications for businesses worldwide.",
    type: "website",
    url: "https://webistrydev.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${cairo.variable}`}>
      <body className={`${plusJakarta.className} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
