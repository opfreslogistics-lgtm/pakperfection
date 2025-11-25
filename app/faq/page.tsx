'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What type of cuisine do you serve?',
          a: 'We specialize in authentic African cuisine and international dishes. Our menu features traditional recipes from various African countries, as well as popular international favorites.'
        },
        {
          q: 'Do you offer vegetarian or vegan options?',
          a: 'Yes! We have a variety of vegetarian and vegan dishes available. Please inform your server about any dietary restrictions, and we\'ll be happy to accommodate you.'
        },
        {
          q: 'Is the restaurant family-friendly?',
          a: 'Absolutely! We welcome families and have a kids menu available. High chairs and booster seats are provided upon request.'
        },
        {
          q: 'Do you take reservations?',
          a: 'Yes, we accept reservations for parties of all sizes. You can make a reservation online through our website or by calling us directly.'
        },
      ]
    },
    {
      category: 'Menu & Ordering',
      questions: [
        {
          q: 'Can I customize my order?',
          a: 'Yes, we\'re happy to accommodate customizations when possible. Please mention any special requests when placing your order, and we\'ll do our best to fulfill them.'
        },
        {
          q: 'Do you offer takeout?',
          a: 'Yes, we offer takeout service. You can place your order online or by phone. Orders are typically ready within 20-30 minutes.'
        },
        {
          q: 'What are your delivery options?',
          a: 'We offer delivery within a 10-mile radius. Delivery fees vary based on distance. You can place delivery orders through our website or by calling us.'
        },
        {
          q: 'Do you have a kids menu?',
          a: 'Yes, we have a dedicated kids menu with child-friendly portions and options. Ask your server for details.'
        },
      ]
    },
    {
      category: 'Events & Catering',
      questions: [
        {
          q: 'Do you cater events?',
          a: 'Yes! We provide full catering services for events of all sizes, from intimate gatherings to large celebrations. Contact us for a custom quote.'
        },
        {
          q: 'How far in advance should I book catering?',
          a: 'We recommend booking at least 2-3 weeks in advance for large events, though we can sometimes accommodate shorter notice depending on availability.'
        },
        {
          q: 'Can I host a private event at the restaurant?',
          a: 'Yes, we have private dining spaces available for events. Contact us to discuss your needs and availability.'
        },
        {
          q: 'What types of events do you cater?',
          a: 'We cater weddings, corporate events, birthday parties, anniversaries, and any other special occasion. We can customize menus to fit your event theme.'
        },
      ]
    },
    {
      category: 'Payment & Policies',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept cash, credit cards, debit cards, Zelle, and CashApp. Payment details are available at checkout.'
        },
        {
          q: 'What is your cancellation policy?',
          a: 'For reservations, please cancel at least 24 hours in advance. For catering orders, cancellation policies vary based on the event size and timing.'
        },
        {
          q: 'Do you offer gift cards?',
          a: 'Yes! Gift cards are available in any amount and can be purchased in-store or online. They never expire and make perfect gifts.'
        },
        {
          q: 'What is your refund policy?',
          a: 'Refunds are handled on a case-by-case basis. If you\'re not satisfied with your order, please contact us immediately, and we\'ll work to resolve the issue.'
        },
      ]
    },
  ]

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen">
      <Navigation branding={null} navSettings={null} theme={null} />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white">
        <div className="text-center z-10">
          <HelpCircle size={64} className="mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Everything You Need to Know</p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => {
                  const index = faqs.slice(0, catIdx).reduce((acc, cat) => acc + cat.questions.length, 0) + qIdx
                  const isOpen = openIndex === index
                  
                  return (
                    <div
                      key={qIdx}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-lg text-gray-900 dark:text-white pr-4">{faq.q}</span>
                        <ChevronDown
                          size={24}
                          className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">We're here to help! Contact us and we'll get back to you as soon as possible.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/contact"
              className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Contact Us
            </a>
            <a
              href="tel:+14195168739"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>

      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}





