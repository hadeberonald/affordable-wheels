'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await supabase.from('contact_submissions').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }])
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 5000)
    } catch {
      setError('Something went wrong. Please call us directly on 082 344 7996.')
    }
    setSubmitting(false)
  }

  return (
    <div className="pt-[67px] md:pt-[73px] min-h-screen bg-[#020202]">

      {/* Header */}
      <section className="relative bg-[#020202] border-b border-charcoal py-20 overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" />
        <div className="absolute top-0 left-3 bottom-0 w-0.5" style={{ background: 'rgba(228,172,41,0.2)' }} />
        <div className="absolute inset-0 track-lines opacity-60" />

        <div className="relative max-w-7xl mx-auto px-8 md:px-12">
          <p className="section-label mb-4">Reach Out</p>
          <div className="gold-rule mb-6" />
          <h1 className="font-display text-5xl md:text-6xl text-offwhite uppercase leading-none mb-4">
            Get In{' '}
            <span className="font-serif-italic" style={{ color: '#e4ac29' }}>Touch</span>
          </h1>
          <p className="text-muted text-lg max-w-xl leading-relaxed">
            Questions about a specific vehicle, pricing, or trade-ins? We are here
            to help — no pressure, just honest answers.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-offwhite">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact info */}
            <div>
              <h2 className="font-display text-2xl uppercase text-gray-900 mb-8">Contact Information</h2>
              <div className="gold-rule mb-8" />

              <div className="space-y-6 mb-10">
                {[
                  {
                    Icon: MapPin,
                    title: 'Address',
                    content: (
                      <p className="text-gray-500 text-sm leading-relaxed">
                        56 Montague Street<br />Newcastle, 2940<br />KwaZulu-Natal, South Africa
                      </p>
                    ),
                  },
                  {
                    Icon: Phone,
                    title: 'Phone',
                    content: (
                      <a href="tel:0823447996" className="text-gray-500 text-sm hover:text-gold-dark transition-colors">
                        082 344 7996
                      </a>
                    ),
                  },
                  {
                    Icon: Mail,
                    title: 'Email',
                    content: (
                      <a href="mailto:info@affordablewheels.co.za" className="text-gray-500 text-sm hover:text-gold-dark transition-colors">
                        info@affordablewheels.co.za
                      </a>
                    ),
                  },
                  {
                    Icon: Clock,
                    title: 'Business Hours',
                    content: (
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Monday – Friday: 8:00 AM – 5:30 PM<br />
                        Saturday: 9:00 AM – 3:00 PM<br />
                        Sunday: Closed
                      </p>
                    ),
                  },
                ].map(({ Icon, title, content }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[#020202]"
                      style={{ border: '1px solid rgba(228,172,41,0.3)' }}
                    >
                      <Icon className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-1">{title}</h3>
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="overflow-hidden border border-gray-200 h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.0!2d29.9319!3d-27.7572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s56%20Montague%20Street%2C%20Newcastle%2C%202940!5e0!3m2!1sen!2sza!4v1234567890!5m2!1sen!2sza"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Affordable Wheels Location"
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="font-display text-2xl uppercase text-gray-900 mb-8">Send Us a Message</h2>
              <div className="gold-rule mb-8" />

              {submitted ? (
                <div
                  className="bg-[#020202] p-10 text-center"
                  
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
                  <div className="w-12 h-12 border border-gold flex items-center justify-center mx-auto mb-5">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl uppercase text-offwhite mb-2">Message Received</h3>
                  <p className="text-muted text-sm">Thank you for reaching out. We will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name *</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors placeholder-gray-300"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email *</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors placeholder-gray-300"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Phone</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors placeholder-gray-300"
                        placeholder="+27 82 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Subject *</label>
                    <select
                      name="subject" value={formData.subject} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Vehicle Inquiry">Vehicle Inquiry</option>
                      <option value="Schedule Test Drive">Schedule Test Drive</option>
                      <option value="Trade-In Valuation">Trade-In Valuation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Message *</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} required rows={6}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm outline-none focus:border-gold-dark transition-colors resize-none placeholder-gray-300"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="btn-gold w-full py-3.5 text-xs disabled:opacity-50">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">* Required fields</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom info cards */}
      <section className="py-16 bg-[#020202] border-t border-charcoal">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Test Drives', body: 'Book a test drive and experience the vehicle before you commit. No obligation, no pressure.' },
              { title: 'Trade-In Assessment', body: 'Bring your current vehicle for a free, honest valuation and a fair trade-in offer.' },
              { title: 'Vehicle Inquiries', body: 'Want more detail on a specific vehicle? Contact us and we will walk you through everything.' },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="border border-charcoal p-7 text-center group hover:border-gold-subtle transition-all duration-300"
              >
                <div className="gold-rule mx-auto mb-4" />
                <h3 className="font-display text-sm uppercase tracking-wide text-gold mb-3">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
