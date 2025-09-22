import './globals.css'
import '../styles/katex.css'
import { ThemeProvider } from '@/lib/theme-context'
import { AppToaster } from '@/components/toaster'

export const metadata = {
  title: 'ArcGPT',
  description: 'A ChatGPT Clone built with ShadCN UI Powered By Pollinations AI',
  icons: {
    icon: '/arcchat.png',
    apple: '/arcchat.png',
    shortcut: '/arcchat.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans bg-background text-foreground`}>
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
