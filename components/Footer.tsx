import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#020202] border-t border-charcoal">
      {/* Gold top line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #e4ac29 30%, #e4ac29 70%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="mb-5">
              <Image
                src="/logo.jpg"
                alt="Affordable Wheels"
                width={170}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-muted text-sm leading-relaxed mb-7 max-w-sm">
              Newcastle's trusted destination for quality pre-owned vehicles. Every car
              on our floor is inspected, honestly priced, and ready to drive. Cash sales
              and trade-ins welcome.
            </p>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e4ac29' }} />
                <span>56 Montague Street, Newcastle, South Africa, 2940</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#e4ac29' }} />
                <a href="tel:0823447996" className="hover:text-offwhite transition-colors">082 344 7996</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#e4ac29' }} />
                <a href="mailto:info@affordablewheels.co.za" className="hover:text-offwhite transition-colors">
                  info@affordablewheels.co.za
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e4ac29' }} />
                <div>
                  <p>Mon – Fri: 8:00 AM – 5:30 PM</p>
                  <p>Sat: 9:00 AM – 3:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="font-display text-offwhite text-sm uppercase tracking-widest mb-5">
              Quick Links
            </h3>
            <div className="gold-rule mb-5" />
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/vehicles', label: 'Browse Stock' },
 
                { href: '/contact', label: 'Contact' },
                { href: '/auth/login', label: 'Staff Login' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted hover:text-gold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3 md:col-start-10">
            <h3 className="font-display text-offwhite text-sm uppercase tracking-widest mb-5">
              What We Offer
            </h3>
            <div className="gold-rule mb-5" />
            <ul className="space-y-3 text-sm text-muted">
              <li>Cash Vehicle Sales</li>
              <li>Trade-In Valuations</li>
              <li>Pre-Purchase Inspections</li>
              <li>Test Drives</li>
              <li>Vehicle History Reports</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Affordable Wheels. All rights reserved.
          </p>
          <p className="text-xs text-muted">affordablewheels.co.za</p>
        </div>
      </div>
    </footer>
  )
}
