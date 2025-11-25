'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { generateOrderNumber, formatPrice } from '@/lib/utils'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import { Loader2, Check, ArrowRight, ArrowLeft, MapPin, Clock, Users, Package, CreditCard, Receipt } from 'lucide-react'
import AddressAutocomplete from '@/components/checkout/address-autocomplete'
import AuthPrompt from '@/components/checkout/auth-prompt'
import { getStripe } from '@/lib/stripe/client'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'dine_in' | 'delivery'>('pickup')
  const [currentStep, setCurrentStep] = useState(1)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialInstructions: '',
    tableNumber: '',
    pickupTime: '',
    guests: '2',
  })
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [tipType, setTipType] = useState<'percent' | 'custom' | 'none'>('none')
  const [customTip, setCustomTip] = useState('')
  const [calculatedTip, setCalculatedTip] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (storedCart.length === 0) {
      router.push('/menu')
      return
    }
    setCart(storedCart)
    loadPaymentMethods()
    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true)
        checkAuth()
      } else {
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Reload address when delivery type changes to delivery
  useEffect(() => {
    if (deliveryType === 'delivery' && isAuthenticated) {
      loadUserAddress()
    }
  }, [deliveryType, isAuthenticated])

  const loadUserAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: defaultAddress } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()
      
      if (defaultAddress) {
        setFormData(prev => ({
          ...prev,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zip: defaultAddress.zip,
        }))
      }
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    
    if (user) {
      // Load user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        // Auto-fill name and email
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: profile.phone || prev.phone,
        }))
      } else {
        // Fallback to email if no profile
        setFormData(prev => ({
          ...prev,
          name: user.email?.split('@')[0] || '',
          email: user.email || '',
        }))
      }
      
    }
  }

  const loadPaymentMethods = async () => {
    const { data } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('enabled', true)
    
    if (data) {
      setPaymentMethods(data)
    }
  }

  // Calculate subtotal using totalPrice from cart items (includes modifiers and upsells)
  const calculateSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      // Use totalPrice if available (includes modifiers and upsells), otherwise calculate
      if (item.totalPrice) {
        return sum + item.totalPrice
      }
      // Fallback: calculate from base price
      const basePrice = parseFloat(item.price) || 0
      let modifierPrice = 0
      let upsellPrice = 0
      
      // Calculate modifier prices
      if (item.selectedModifiers) {
        Object.entries(item.selectedModifiers).forEach(([groupId, options]: [string, any]) => {
          const modifierGroup = item.modifiers?.find((m: any) => m.id === groupId)
          if (modifierGroup) {
            Object.entries(options || {}).forEach(([optionId, qty]: [string, any]) => {
              const option = modifierGroup.options?.find((o: any) => o.id === optionId)
              if (option && qty > 0) {
                modifierPrice += parseFloat(option.price_modifier || 0) * qty
              }
            })
          }
        })
      }
      
      // Calculate upsell prices
      if (item.selectedUpsells) {
        item.selectedUpsells.forEach((upsell: any) => {
          const qty = upsell.quantity || 1
          upsellPrice += parseFloat(upsell.price || 0) * qty
        })
      }
      
      return sum + (basePrice + modifierPrice + upsellPrice) * (item.quantity || 1)
    }, 0)
  }, [cart])

  // Calculate tip
  useEffect(() => {
    const subtotal = calculateSubtotal
    const tax = subtotal * 0.08
    const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0
    const baseAmount = subtotal + tax + deliveryFee

    if (tipType === 'percent') {
      setCalculatedTip(baseAmount * (tipAmount / 100))
    } else if (tipType === 'custom') {
      setCalculatedTip(parseFloat(customTip) || 0)
    } else {
      setCalculatedTip(0)
    }
  }, [tipType, tipAmount, customTip, calculateSubtotal, deliveryType])

  // Check if form is valid for current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Delivery Type
        return true
      case 2: // Contact Info
        return !!(formData.name && formData.email && formData.phone)
      case 3: // Address (if delivery) or Additional Info
        if (deliveryType === 'delivery') {
          return !!(formData.address && formData.city && formData.state && formData.zip)
        }
        if (deliveryType === 'pickup') {
          return !!formData.pickupTime
        }
        return true
      case 4: // Payment
        return !!selectedPayment
      case 5: // Review
        return true
      default:
        return false
    }
  }

  const nextStep = async () => {
    if (isStepValid()) {
      // Check authentication status before showing prompt
      if (currentStep === 1) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setShowAuthPrompt(true)
          return
        } else {
          // User is authenticated, update state and continue
          setIsAuthenticated(true)
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, 5))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleAddressSelect = (address: {
    street: string
    city: string
    state: string
    zip: string
    fullAddress: string
  }) => {
    setFormData({
      ...formData,
      address: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
    })
  }

  const handleSubmit = async () => {
    if (!isStepValid()) {
      toast.error('Please complete all required fields')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const orderNumber = generateOrderNumber()
      const subtotal = calculateSubtotal
      const tax = subtotal * 0.08
      const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0
      const tip = calculatedTip
      const total = subtotal + tax + deliveryFee + tip
      
      // Ensure total is a valid number
      if (isNaN(total) || total <= 0) {
        toast.error('Invalid order total. Please check your cart.')
        setLoading(false)
        return
      }

      // Update user profile with name and phone if logged in
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.name,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          })
        
        // Save address if delivery and user is logged in
        if (deliveryType === 'delivery' && formData.address && formData.city && formData.state && formData.zip) {
          // Check if address already exists
          const { data: existingAddress } = await supabase
            .from('user_addresses')
            .select('id')
            .eq('user_id', user.id)
            .eq('address', formData.address)
            .eq('city', formData.city)
            .eq('state', formData.state)
            .eq('zip', formData.zip)
            .single()
          
          if (!existingAddress) {
            // Check if user has any addresses
            const { data: userAddresses } = await supabase
              .from('user_addresses')
              .select('id')
              .eq('user_id', user.id)
            
            // Set as default if it's the first address
            const isDefault = !userAddresses || userAddresses.length === 0
            
            await supabase
              .from('user_addresses')
              .insert({
                user_id: user.id,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                is_default: isDefault,
              })
          }
        }
      }

      const orderData = {
        user_id: user?.id || null,
        order_number: orderNumber,
        payment_method: selectedPayment,
        payment_status: 'pending',
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? formData.address : null,
        delivery_instructions: deliveryType === 'delivery' ? `${formData.city}, ${formData.state} ${formData.zip}` : null,
        table_number: deliveryType === 'dine_in' ? formData.tableNumber : null,
        pickup_time: deliveryType === 'pickup' ? formData.pickupTime : null,
        ordering_method: deliveryType,
        tip_amount: tip,
        special_instructions: formData.specialInstructions,
        total_amount: total,
        current_status: 'pending_payment',
        items: cart,
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error

      // Handle Stripe payment differently
      if (selectedPayment === 'stripe') {
        await handleStripeCheckout()
        return
      }

      // Clear cart
      localStorage.removeItem('cart')

      // Redirect immediately based on payment method (use replace for faster navigation)
      if (selectedPayment === 'zelle' || selectedPayment === 'cashapp') {
        router.replace(`/payment-proof/${order.id}`)
      } else {
        router.replace(`/thank-you/${order.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    try {
      const subtotal = calculateSubtotal
      const tax = subtotal * 0.08
      const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0
      const tip = calculatedTip
      const total = subtotal + tax + deliveryFee + tip

      // Prepare order data for Stripe
      const orderData = {
        items: cart.map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.totalPrice ? (item.totalPrice / item.quantity).toFixed(2) : item.price,
          quantity: item.quantity,
          image_url: item.image_url || item.image,
        })),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        delivery_fee: deliveryFee.toFixed(2),
        tip: tip.toFixed(2),
        total: total.toFixed(2),
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        order_type: deliveryType,
        delivery_address: deliveryType === 'delivery' 
          ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}` 
          : '',
        special_instructions: formData.specialInstructions || '',
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      })

      const { sessionId, url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Clear cart before redirecting to Stripe
      localStorage.removeItem('cart')

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        const stripe = await getStripe()
        await stripe?.redirectToCheckout({ sessionId })
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const selectedPaymentMethod = paymentMethods.find(pm => pm.method === selectedPayment)
  const subtotal = calculateSubtotal
  const tax = subtotal * 0.08
  const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0
  const total = subtotal + tax + deliveryFee + calculatedTip

  const steps = [
    { number: 1, title: 'Delivery Type', icon: Package },
    { number: 2, title: 'Contact Info', icon: Users },
    { number: 3, title: 'Address', icon: MapPin },
    { number: 4, title: 'Payment', icon: CreditCard },
    { number: 5, title: 'Review', icon: Receipt },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Complete your order in a few simple steps</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-yellow-500 border-red-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={24} />
                      ) : (
                        <StepIcon size={24} />
                      )}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {/* Step 1: Delivery Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Choose Your Delivery Option</h2>
                    <p className="text-gray-600 dark:text-gray-400">Select how you'd like to receive your order</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-6 border-2 rounded-xl transition-all text-left ${
                        deliveryType === 'pickup'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                      }`}
                    >
                      <Package className={`mb-3 ${deliveryType === 'pickup' ? 'text-red-600' : 'text-gray-400'}`} size={32} />
                      <h3 className="font-bold text-lg mb-1">Pickup</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pick up your order at the restaurant</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('dine_in')}
                      className={`p-6 border-2 rounded-xl transition-all text-left ${
                        deliveryType === 'dine_in'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                      }`}
                    >
                      <Users className={`mb-3 ${deliveryType === 'dine_in' ? 'text-red-600' : 'text-gray-400'}`} size={32} />
                      <h3 className="font-bold text-lg mb-1">Dine In</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enjoy your meal at our restaurant</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-6 border-2 rounded-xl transition-all text-left ${
                        deliveryType === 'delivery'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                      }`}
                    >
                      <MapPin className={`mb-3 ${deliveryType === 'delivery' ? 'text-red-600' : 'text-gray-400'}`} size={32} />
                      <h3 className="font-bold text-lg mb-1">Delivery</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">We'll deliver to your address</p>
                      <span className="text-xs text-red-600 font-semibold mt-2 block">+$5.00 delivery fee</span>
                    </button>
                  </div>
                  <div className="flex justify-end pt-6 border-t">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Contact Information</h2>
                    <p className="text-gray-600 dark:text-gray-400">We'll use this to confirm your order</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="(419) 555-1234"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Address / Additional Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {deliveryType === 'delivery' ? 'Delivery Address' : deliveryType === 'pickup' ? 'Pickup Details' : 'Dine-In Details'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {deliveryType === 'delivery' 
                        ? 'Enter your delivery address' 
                        : deliveryType === 'pickup'
                        ? 'When would you like to pick up?'
                        : 'Tell us about your visit'}
                    </p>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 font-semibold">Street Address *</label>
                        <AddressAutocomplete
                          value={formData.address}
                          onChange={(address) => setFormData({ ...formData, address })}
                          onAddressSelect={handleAddressSelect}
                          placeholder="Start typing your address..."
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-2 font-semibold">City *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-semibold">State *</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-semibold">ZIP Code *</label>
                          <input
                            type="text"
                            value={formData.zip}
                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {deliveryType === 'pickup' && (
                    <div>
                      <label className="block mb-2 font-semibold">Pickup Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}

                  {deliveryType === 'dine_in' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 font-semibold">Table Number (Optional)</label>
                        <input
                          type="text"
                          value={formData.tableNumber}
                          onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Table 5"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">Number of Guests</label>
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment Method */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Select Payment Method</h2>
                    <p className="text-gray-600 dark:text-gray-400">Choose how you'd like to pay</p>
                  </div>

                  {/* Payment Method Buttons - 3 side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => {
                      const settings = method.settings || {}
                      const isSelected = selectedPayment === method.method
                      return (
                        <button
                          key={method.method}
                          type="button"
                          onClick={() => setSelectedPayment(method.method)}
                          className={`p-6 border-2 rounded-xl transition-all text-center ${
                            isSelected
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                          }`}
                        >
                          {settings.logo_url && (
                            <Image
                              src={settings.logo_url}
                              alt={method.method}
                              width={80}
                              height={80}
                              className="mx-auto mb-3 object-contain"
                            />
                          )}
                          <h3 className="font-bold text-lg capitalize mb-1">{method.method}</h3>
                          {isSelected && <Check className="mx-auto mt-2 text-red-600" size={24} />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Payment Instructions - Display when selected */}
                  {selectedPaymentMethod && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                      <h3 className="text-xl font-bold mb-4 capitalize">{selectedPaymentMethod.method} Payment Instructions</h3>
                      {selectedPaymentMethod.method === 'zelle' && (
                        <div className="space-y-3">
                          {selectedPaymentMethod.settings?.logo_url && (
                            <div className="flex justify-center mb-4">
                              <Image
                                src={selectedPaymentMethod.settings.logo_url}
                                alt="Zelle"
                                width={120}
                                height={60}
                                className="object-contain"
                              />
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.phone && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                              <p className="font-semibold mb-1">Send to Phone:</p>
                              <p className="text-lg font-mono text-red-600">{selectedPaymentMethod.settings.phone}</p>
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.email && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                              <p className="font-semibold mb-1">Send to Email (Alternative):</p>
                              <p className="text-lg font-mono text-red-600">{selectedPaymentMethod.settings.email}</p>
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.instructions && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed">{selectedPaymentMethod.settings.instructions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPaymentMethod.method === 'cashapp' && (
                        <div className="space-y-3">
                          {selectedPaymentMethod.settings?.logo_url && (
                            <div className="flex justify-center mb-4">
                              <Image
                                src={selectedPaymentMethod.settings.logo_url}
                                alt="CashApp"
                                width={120}
                                height={60}
                                className="object-contain"
                              />
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.qr_code_url && (
                            <div className="flex justify-center mb-4">
                              <Image
                                src={selectedPaymentMethod.settings.qr_code_url}
                                alt="CashApp QR Code"
                                width={200}
                                height={200}
                                className="rounded-lg border-4 border-white dark:border-gray-800"
                              />
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.cashtag && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                              <p className="font-semibold mb-2">Send to Cashtag:</p>
                              <p className="text-3xl font-bold font-mono text-red-600">{selectedPaymentMethod.settings.cashtag}</p>
                            </div>
                          )}
                          {selectedPaymentMethod.settings?.instructions && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed">{selectedPaymentMethod.settings.instructions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPaymentMethod.method === 'cash' && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                          <p className="text-lg">No action needed. Pay with cash when you arrive or when the delivery driver arrives.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!selectedPayment}
                      className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Place Order */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Review Your Order</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please review all details before placing your order</p>
                  </div>

                  {/* Tip Selection */}
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">Add Tip (Optional)</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setTipType('percent')
                            setTipAmount(10)
                            setCustomTip('')
                          }}
                          className={`p-4 border-2 rounded-lg transition-all font-semibold ${
                            tipType === 'percent' && tipAmount === 10
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20 scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                          }`}
                        >
                          10%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipType('percent')
                            setTipAmount(15)
                            setCustomTip('')
                          }}
                          className={`p-4 border-2 rounded-lg transition-all font-semibold ${
                            tipType === 'percent' && tipAmount === 15
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20 scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                          }`}
                        >
                          15%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipType('percent')
                            setTipAmount(20)
                            setCustomTip('')
                          }}
                          className={`p-4 border-2 rounded-lg transition-all font-semibold ${
                            tipType === 'percent' && tipAmount === 20
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20 scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                          }`}
                        >
                          20%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipType('none')
                            setTipAmount(0)
                            setCustomTip('')
                          }}
                          className={`p-4 border-2 rounded-lg transition-all font-semibold ${
                            tipType === 'none'
                              ? 'border-gray-400 bg-gray-100 dark:bg-gray-700 scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          No Tip
                        </button>
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">Custom Tip Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={customTip}
                          onChange={(e) => {
                            setCustomTip(e.target.value)
                            setTipType('custom')
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter custom amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">Special Instructions (Optional)</h3>
                    <textarea
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={4}
                      placeholder="Any special requests or instructions..."
                    />
                  </div>

                  {/* Order Items Review */}
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {cart.map((item, idx) => {
                        const itemTotal = item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1)
                        return (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-start gap-3 mb-2">
                              {item.image_url && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  <span className="font-bold text-red-600">{formatPrice(itemTotal)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            
                            {/* Show Modifiers */}
                            {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Customizations:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(item.selectedModifiers).map(([groupId, options]: [string, any]) => {
                                    const modifierGroup = item.modifiers?.find((m: any) => m.id === groupId)
                                    if (!modifierGroup || !options) return null
                                    return Object.entries(options).map(([optionId, qty]: [string, any]) => {
                                      if (qty === 0) return null
                                      const option = modifierGroup.options?.find((o: any) => o.id === optionId)
                                      if (!option) return null
                                      return (
                                        <span key={optionId} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                          {option.name}×{qty}
                                        </span>
                                      )
                                    })
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Show Upsells */}
                            {item.selectedUpsells && item.selectedUpsells.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Add-ons:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.selectedUpsells.map((upsell: any, uIdx: number) => (
                                    <span key={uIdx} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                      {upsell.name}×{upsell.quantity || 1}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Summary Preview */}
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gradient-to-br from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-semibold">{formatPrice(tax)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                        </div>
                      )}
                      {calculatedTip > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Tip</span>
                          <span className="font-semibold">{formatPrice(calculatedTip)}</span>
                        </div>
                      )}
                      <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between text-2xl font-bold">
                        <span>Total</span>
                        <span className="text-red-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    {/* Place Order Button - Only shows when all fields are valid */}
                    {isStepValid() && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            Place Order
                            <ArrowRight size={24} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                {calculatedTip > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Tip</span>
                    <span className="font-semibold">{formatPrice(calculatedTip)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPrompt
          onContinue={() => {
            setShowAuthPrompt(false)
            setCurrentStep(2)
          }}
          onAuthSuccess={() => {
            setShowAuthPrompt(false)
            setIsAuthenticated(true)
            setCurrentStep(2)
            checkAuth()
          }}
        />
      )}
    </div>
  )
}

