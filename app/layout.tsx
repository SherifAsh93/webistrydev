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
  metadataBase: new URL("https://webistrydev.com"),
  title: "Webistrydev — Global Software Solutions for Modern Businesses",
  description:
    "I build fast, elegant websites and web applications for businesses worldwide. E-commerce, brand sites, clinic apps, and custom web platforms.",
  keywords: ["web developer", "freelance", "Next.js", "React", "full-stack", "e-commerce"],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Webistrydev" },
  openGraph: {
    title: "Webistrydev — Global Software Solutions for Modern Businesses",
    description: "I build fast, elegant websites and web applications for businesses worldwide.",
    type: "website",
    url: "https://webistrydev.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webistrydev — Global Software Solutions for Modern Businesses",
    description: "I build fast, elegant websites and web applications for businesses worldwide.",
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
    if(ls[0]&&ls[0].toLowerCase().startsWith('ar')){saved='ar';}
  }
  if(saved==='ar'){
    document.documentElement.lang='ar';
    document.documentElement.dir='rtl';
  }
}catch(e){}})();
`;

const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

const metaPixelScript = fbPixelId
  ? `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fbPixelId}');
fbq('track', 'PageView');
`
  : "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking script: sets dir/lang before first paint — no RTL flash */}
        <script dangerouslySetInnerHTML={{ __html: langDetectScript }} />
        {fbPixelId && (
          <>
            <script dangerouslySetInnerHTML={{ __html: metaPixelScript }} />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                alt=""
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${plusJakarta.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
