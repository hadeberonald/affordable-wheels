import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-5">
              <Image
                src="/logo.jpg"
                alt="Dealz On Wheelz"
                width={180}
                height={54}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-mid text-sm leading-relaxed mb-6 max-w-sm">
              Quality pre-owned vehicles in Springs, Gauteng. Every car on our floor is inspected,
              priced fairly, and ready to drive away. Cash sales and trade-ins welcome.
            </p>
            <div className="space-y-3 text-sm text-mid">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>159 2nd St, Springs New, Springs, 1559</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:0113623114" className="hover:text-white transition-colors">011 362 3114</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:info@dealzonwheelz.co.za" className="hover:text-white transition-colors">
                  info@dealzonwheelz.co.za
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p>Mon – Fri: 8:00 AM – 5:30 PM</p>
                  <p>Sat: 9:00 AM – 3:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/',           label: 'Home' },
                { href: '/vehicles',   label: 'Browse Stock' },
                { href: '/about',      label: 'About Us' },
                { href: '/contact',    label: 'Contact' },
                { href: '/auth/login', label: 'Staff Login' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-mid hover:text-accent transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              What We Offer
            </h3>
            <ul className="space-y-3 text-sm text-mid">
              <li>Cash Vehicle Sales</li>
              <li>Trade-In Valuations</li>
              <li>Pre-Purchase Inspections</li>
              <li>Test Drives by Appointment</li>
              <li>Vehicle History Reports</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mid">
            &copy; {new Date().getFullYear()} Dealz On Wheelz. All rights reserved.
          </p>
          <p className="text-xs text-mid">dealzonwheelz.co.za</p>
        </div>
      </div>
    </footer>
  )
}