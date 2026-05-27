import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CookieConsent } from "@/components/common/cookie-consent"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: 'Operaly | Tu asistente de IA para WhatsApp',
  description: 'Operaly es el asistente de inteligencia artificial para WhatsApp que ayuda a profesionales y empresas a gestionar clientes, agendar citas, vender y automatizar la atención al cliente.',
  keywords: ['WhatsApp', 'IA', 'asistente virtual', 'CRM', 'automatización', 'atención al cliente', 'agenda', 'profesionales', 'empresas'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('operaly_web_locale')?.value ?? 'es'

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  )
}
