import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo.mjs";

export const metadata = {
  metadataBase: new URL("https://realtanishqtiwari.in"),
  title: {
    default: SITE_TITLE,
    template: "%s | Tanishq Tiwari",
  },
  description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
    siteName: "Tanishq Tiwari Portfolio",
    images: [{ url: "/images/social/portfolio.png", width: 1200, height: 630, alt: "Tanishq Tiwari — Frontend Developer, React, Next.js and JavaScript" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/social/portfolio.png"],
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
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
      </body>
    </html>
  );
}
