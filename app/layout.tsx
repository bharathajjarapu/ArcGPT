import './globals.css'
import '../styles/katex.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { ThemeColorProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ArcGPT',
  description: 'A ChatGPT Clone built with ShadCN UI Powered By Pollinations AI',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorProvider>
            {children}
          </ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
