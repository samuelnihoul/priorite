import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'priorite',
  description: 'Participative global priority ranking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <html lang="en"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9447057784385518"
      crossOrigin="anonymous"></script> <head>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
