'use client'

import { MapPin, Phone, Clock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function LocationSection() {
  return (
    <section className="py-20 px-4 bg-primary text-secondary">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Visit Us in Lima, Ohio</h2>
            <p className="text-xl opacity-90">
              Experience authentic African and international cuisine in the heart of Lima
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <MapPin size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Location</h3>
                  <p className="opacity-90">
                    1502 OAKLAND PKWY<br />
                    LIMA, OH 45805
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <Phone size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                  <p className="opacity-90">
                    <Link href="tel:+14195168739" className="hover:underline text-lg font-semibold">
                      +1 (419) 516-8739
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <Clock size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Hours</h3>
                  <p className="opacity-90">
                    Mon - Thu: 11am - 10pm<br />
                    Fri - Sat: 11am - 11pm<br />
                    Sun: 12pm - 9pm
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <Mail size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="opacity-90">
                    <Link href="mailto:info@pakperfectioninter.com" className="hover:underline">
                      info@pakperfectioninter.com
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-block bg-secondary text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}




