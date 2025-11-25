'use client'

import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function StripeCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Cancel Header */}
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-100">Your order was not completed</p>
          </div>

          {/* Message */}
          <div className="p-8">
            <div className="mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Don't worry! No charges have been made to your account.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Your cart items are still saved. You can continue shopping or try checking out again when you're ready.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">What would you like to do?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Return to Cart</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review your items and try again
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Continue Shopping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Browse our menu for more delicious items
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/cart"
                className="flex-1 text-center bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Return to Cart
              </Link>
              <Link
                href="/menu"
                className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
