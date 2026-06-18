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
    url: "https://webistrydev.com",
    images: [{ url: "https://webistrydev.com/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webistrydev — Full-Stack Web Developer",
    description: "I build fast, elegant websites and web applications for businesses worldwide.",
    images: ["https://webistrydev.com/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

// Runs synchronously before React paints — sets dir/lang immediately for Arabic users
const langDetectScript = `
(function(){try{
  var saved=localStorage.getItem('lang');
  if(!saved){
    var ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];
    if(ls.some(function(l){return l&&l.toLowerCase().startsWith('ar')})){saved='ar';}
  }
  if(saved==='ar'){
    document.documentElement.lang='ar';
    document.documentElement.dir='rtl';
  }
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking script: sets dir/lang before first paint — no RTL flash */}
        <script dangerouslySetInnerHTML={{ __html: langDetectScript }} />
      </head>
      <body className={`${plusJakarta.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
