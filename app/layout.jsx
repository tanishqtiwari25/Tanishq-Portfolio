import './globals.css'; 

export const metadata = {
  metadataBase: new URL('https://realtanishqtiwari.in'),
  title: {
    default: 'Tanishq Tiwari | Frontend Developer & React Specialist',
    template: '%s | Tanishq Tiwari'
  },
  description: 'Frontend Developer specializing in JavaScript, React.js, Next.js, and modern web applications. Explore responsive projects, interactive UIs, and clean frontend architecture.',
  keywords: [
    'Frontend Developer',
    'React Developer',
    'JavaScript Developer',
    'Next.js Developer',
    'Frontend Engineer',
    'Tanishq Tiwari',
    'Kanpur Web Developer',
    'Portfolio'
  ],
  authors: [{ name: 'Tanishq Tiwari', url: 'https://realtanishqtiwari.in' }],
  creator: 'Tanishq Tiwari',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://realtanishqtiwari.in',
    title: 'Tanishq Tiwari | Frontend Developer & React Specialist',
    description: 'Frontend Developer building modern, scalable, and user-focused web experiences with React.js, Next.js, and JavaScript.',
    siteName: 'Tanishq Tiwari Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tanishq Tiwari | Frontend Developer',
    description: 'Frontend Developer building modern web experiences with React.js & Next.js.',
    creator: '@realtanishqtiwari',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        suppressHydrationWarning 
        className="bg-background text-textMain min-h-screen flex flex-col font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
}