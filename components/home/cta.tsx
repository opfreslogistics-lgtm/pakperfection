'use client'

import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Excellence?</h2>
          <p className="text-xl mb-8 opacity-90">
            Reserve your table today or order online for delivery
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/reservation"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Make Reservation
            </Link>
            <Link
              href="/menu"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Order Online
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}



