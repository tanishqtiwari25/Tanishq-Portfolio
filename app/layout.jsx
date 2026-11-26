import GoogleAnalytics from '@/components/GoogleAnalytics';
import {GA_MEASUREMENT_ID} from '@/lib/analytics.mjs';
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "./globals.css";
import {SITE_TITLE,SITE_DESCRIPTION,SOCIAL_IMAGE} from "@/lib/seo.mjs";

export const metadata = {
  metadataBase: new URL("https://realtanishqtiwari.in"),
  title: {
    default: SITE_TITLE,
    template: "%s | Tanishq Tiwari",
  },
  description:
    SITE_DESCRIPTION,
  alternates: { canonical: "https://realtanishqtiwari.in" },
  keywords: [
    "Frontend Developer",
    "React Developer",
    "JavaScript Developer",
    "Next.js Developer",
    "Frontend Engineer",
    "Tanishq Tiwari",
    "Kanpur Web Developer",
    "Portfolio",
  ],
  authors: [{ name: "Tanishq Tiwari", url: "https://realtanishqtiwari.in" }],
  creator: "Tanishq Tiwari",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://realtanishqtiwari.in",
    title: SITE_TITLE,
    description:
      SITE_DESCRIPTION,
    siteName: "Tanishq Tiwari Portfolio",
    images: [{url:SOCIAL_IMAGE,width:1200,height:630,alt:"Tanishq Tiwari — React and Next.js developer in Kanpur"}],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')||'dark'}catch(e){}",
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-textMain min-h-screen flex flex-col font-sans antialiased"
      >
        {children}
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID}/>
      </body>
    </html>
  );
}
