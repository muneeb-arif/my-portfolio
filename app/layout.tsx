import type { Metadata, Viewport } from 'next'
import { Inter, Open_Sans } from 'next/font/google'
import { AuthProvider } from '@/services/authContext'
import { SettingsProvider } from '@/services/settingsContext'
import { ColorSchemeProvider } from '@/components/ColorSchemeProvider'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

// Dynamic metadata (will be updated by settings)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'),
  title: {
    default: 'Muneeb Arif - Principal Software Engineer',
    template: '%s | Muneeb Arif - Principal Software Engineer'
  },
  description: 'Principal Software Engineer specializing in full-stack development, system architecture, and team leadership. Expert in React, Node.js, and cloud technologies.',
  keywords: [
    'Software Engineer',
    'Principal Engineer',
    'Full Stack Developer',
    'React Developer',
    'Node.js',
    'System Architecture',
    'Team Leadership',
    'Portfolio'
  ],
  authors: [{ name: 'Muneeb Arif', url: 'https://muneebarif.com' }],
  creator: 'Muneeb Arif',
  publisher: 'Muneeb Arif',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
    siteName: 'Muneeb Arif Portfolio',
    title: 'Muneeb Arif - Principal Software Engineer',
    description: 'Principal Software Engineer specializing in full-stack development, system architecture, and team leadership.',
    images: [
      {
        url: '/images/profile/avatar.jpeg',
        width: 1200,
        height: 630,
        alt: 'Muneeb Arif - Principal Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muneeb Arif - Principal Software Engineer',
    description: 'Principal Software Engineer specializing in full-stack development, system architecture, and team leadership.',
    images: ['/images/profile/avatar.jpeg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E9CBA7' },
    { media: '(prefers-color-scheme: dark)', color: '#B8936A' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for faster loading */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Critical CSS variables will be injected here by ColorSchemeProvider */}
      </head>
      <body className="min-h-screen bg-surface text-text antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <SettingsProvider>
                <ColorSchemeProvider>
                  <div id="root" className="min-h-screen">
                    {children}
                  </div>
                  
                  {/* Portal containers */}
                  <div id="modal-root" />
                  <div id="toast-root" />
                  <div id="loading-root" />
                </ColorSchemeProvider>
              </SettingsProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Analytics and third-party scripts can be added here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </html>
  )
} 