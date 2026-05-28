import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Web Corner — Full-Stack Web Developer",
  description:
    "I build fast, elegant websites and web applications for businesses worldwide. E-commerce, brand sites, clinic apps, and custom web platforms.",
  keywords: [
    "web developer",
    "freelance",
    "Next.js",
    "React",
    "full-stack",
    "website",
    "web app",
    "e-commerce",
  ],
  openGraph: {
    title: "Web Corner — Full-Stack Web Developer",
    description:
      "I build fast, elegant websites and web applications for businesses worldwide.",
    type: "website",
    url: "https://web-corner.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased`}>{children}</body>
    </html>
  );
}
