import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const metadata: Metadata = {
  title: 'Affordable Wheels — Quality Pre-Owned Vehicles in Newcastle',
  description:
    'Your trusted pre-owned vehicle dealer in Newcastle, KwaZulu-Natal. Inspected stock, honest pricing, cash sales and trade-ins welcome.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black-deep text-offwhite">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  )
}
