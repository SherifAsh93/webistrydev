import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "700", "900"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Corner | ويب كورنر",
  description: "Software Studio in Damietta",
  icons: {
    icon: "/public/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body className={`${cairo.className} antialiased selection:bg-blue-100`}>
        {children}
      </body>
    </html>
  );
}
