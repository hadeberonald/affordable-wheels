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
        name: formData.name, email: formData.email, phone: formData.phone,
        subject: formData.subject, message: formData.message,
      }])
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 5000)
    } catch {
      setError('Something went wrong. Please call us directly on 011 362 3114.')
    }
    setSubmitting(false)
  }

  return (
    <div className="pt-20 min-h-screen bg-dark">

      {/* Header */}
      <section className="bg-dark-light border-b border-dark-border py-20 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="divider-glow mb-7" />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Get In <span className="text-accent text-glow">Touch</span>
          </h1>
          <p className="text-mid text-lg max-w-xl leading-relaxed">
            Questions about a specific vehicle, pricing, or trade-ins? We are here to help —
            no pressure, just honest answers.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
              <div className="space-y-6 mb-12">
                {[
                  {
                    Icon: MapPin,
                    title: 'Address',
                    content: <p className="text-mid text-sm leading-relaxed">159 2nd St<br />Springs New<br />Springs, 1559<br />Gauteng, South Africa</p>,
                  },
                  {
                    Icon: Phone,
                    title: 'Phone',
                    content: <a href="tel:0113623114" className="text-mid text-sm hover:text-accent transition-colors">011 362 3114</a>,
                  },
                  {
                    Icon: Mail,
                    title: 'Email',
                    content: <a href="mailto:info@dealzonwheelz.co.za" className="text-mid text-sm hover:text-accent transition-colors">info@dealzonwheelz.co.za</a>,
                  },
                  {
                    Icon: Clock,
                    title: 'Business Hours',
                    content: (
                      <p className="text-mid text-sm leading-relaxed">
                        Monday – Friday: 8:00 AM – 5:30 PM<br />
                        Saturday: 9:00 AM – 3:00 PM<br />
                        Sunday: Closed
                      </p>
                    ),
                  },
                ].map(({ Icon, title, content }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-dark-border h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.0!2d28.4497!3d-26.2388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s159%202nd%20St%2C%20Springs%20New%2C%20Springs%2C%201559!5e0!3m2!1sen!2sza!4v1234567890!5m2!1sen!2sza"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Dealz On Wheelz Location"
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Send Us a Message</h2>

              {submitted ? (
                <div className="card-glow p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent</h3>
                  <p className="text-mid text-sm">Thank you for reaching out. We will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="John Doe" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+27 XX XXX XXXX" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Subject *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="input-field">
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Vehicle Inquiry">Vehicle Inquiry</option>
                      <option value="Schedule Test Drive">Schedule Test Drive</option>
                      <option value="Trade-In Valuation">Trade-In Valuation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="input-field resize-none" placeholder="Tell us how we can help..." />
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-xs text-mid text-center">* Required fields</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom cards */}
      <section className="py-16 bg-dark-light border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Test Drives', body: 'Book a test drive and experience the vehicle before you commit. No obligation.' },
              { title: 'Trade-In Assessment', body: 'Bring your current vehicle for a free valuation and honest trade-in offer.' },
              { title: 'Vehicle Inquiries', body: 'Want more detail on a specific vehicle? Contact us and we will walk you through everything.' },
            ].map(({ title, body }) => (
              <div key={title} className="card-hover p-7 text-center">
                <h3 className="text-lg font-semibold text-accent mb-3">{title}</h3>
                <p className="text-mid text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
