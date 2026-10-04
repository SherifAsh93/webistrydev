import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

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

const SITE_URL = "https://www.webistrydev.com";
const SITE_NAME = "WebistryDev";
const SITE_TITLE = "WebistryDev — Custom Websites, E-Commerce & Business Apps";
const SITE_DESCRIPTION =
  "Egypt-based full-stack developer building custom websites, online stores, booking systems and business apps for owners in Egypt and abroad. Bilingual Arabic & English, projects from $440.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "web developer Egypt",
    "freelance web developer",
    "custom website development",
    "e-commerce development Egypt",
    "booking system development",
    "POS system Egypt",
    "Next.js developer",
    "React developer",
    "Arabic website RTL",
    "business app development",
  ],
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Webistrydev" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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

// GA4 — active only when NEXT_PUBLIC_GA_ID is set in the environment
const gaId = process.env.NEXT_PUBLIC_GA_ID;

const gaScript = gaId
  ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`
  : "";

// Structured data — helps search engines understand the business and surface it in results
const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/icon.svg`,
      description: SITE_DESCRIPTION,
      email: "sherif.hany@proton.me",
      telephone: "+201007526882",
      priceRange: "$440+",
      currenciesAccepted: "EGP, USD",
      areaServed: ["Egypt", "Worldwide"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
      founder: {
        "@type": "Person",
        name: "Sherif Hany",
        jobTitle: "Full-Stack Developer",
      },
      sameAs: ["https://www.facebook.com/WebistryDev"],
      availableLanguage: ["ar", "en"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web & App Development Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Basic Website" }, priceCurrency: "EGP", price: "20000" },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business App with Admin Panel" }, priceCurrency: "EGP", price: "45000" },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "E-Commerce App" }, priceCurrency: "EGP", price: "75000" },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Enterprise App" }, priceCurrency: "EGP", price: "120000" },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: ["en", "ar"],
      publisher: { "@id": `${SITE_URL}/#business` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need a complete project brief?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Tell me what your business does and what you want to improve, or leave your name and contact number. We'll work out the required pages and features before I quote.",
          },
        },
        {
          "@type": "Question",
          name: "Can you work with clients outside Egypt?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. We can work remotely in Arabic or English. Include your country code in the contact form, or start a WhatsApp conversation.",
          },
        },
        {
          "@type": "Question",
          name: "What determines the price?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The number of pages, admin features, payment methods, and integrations. Packages provide an initial guide; we agree the scope, price, and timeline before work starts.",
          },
        },
        {
          "@type": "Question",
          name: "Does sending a request commit me to buying?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The initial discussion and quote are free. Payment comes after we agree on the project, according to the terms in your quote.",
          },
        },
      ],
    },
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking script: sets dir/lang before first paint — no RTL flash */}
        <script dangerouslySetInnerHTML={{ __html: langDetectScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
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
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: gaScript }} />
          </>
        )}
      </head>
      <body className={`${plusJakarta.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
