'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { formatPrice } from '@/lib/utils'

export default function PaymentProofPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofUrl, setProofUrl] = useState<string>('')
  const [comments, setComments] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderData) {
      setOrder(orderData)

      // Load payment method details
      const { data: paymentData } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('method', orderData.payment_method)
        .single()

      if (paymentData) {
        setPaymentMethod(paymentData)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProof = async () => {
    if (!proofFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `proof_${orderId}_${Date.now()}.${fileExt}`
      const filePath = `payment-proofs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, proofFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      return urlData.publicUrl
    } catch (error: any) {
      toast.error('Failed to upload: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const submitProof = async () => {
    if (!proofFile) {
      toast.error('Please upload payment proof')
      return
    }

    setSubmitting(true)
    try {
      const fileUrl = await uploadProof()
      if (!fileUrl) {
        setSubmitting(false)
        return
      }

      // Save payment proof
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .insert({
          order_id: orderId,
          file_url: fileUrl,
          comments: comments,
          verified: false
        })

      if (proofError) throw proofError

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'pending',
          current_status: 'pending_payment'
        })
        .eq('id', orderId)

      if (orderError) throw orderError

      toast.success('Payment proof submitted! We will verify it shortly.')
      router.push(`/thank-you/${orderId}`)
    } catch (error: any) {
      toast.error('Failed to submit: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!order || !paymentMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  const settings = paymentMethod.settings || {}

  return (
    <div className="min-h-screen">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
            <h1 className="text-4xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Order #{order.order_number}
            </p>
            <p className="text-2xl font-bold text-green-600 mt-4">
              {formatPrice(parseFloat(order.total_amount))}
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 capitalize">{paymentMethod.method} Payment</h2>
            
            {paymentMethod.method === 'zelle' && (
              <div className="space-y-4">
                {settings.logo_url && (
                  <Image src={settings.logo_url} alt="Zelle" width={100} height={50} className="mb-4" />
                )}
                {settings.phone && (
                  <div>
                    <p className="font-semibold mb-1">Send to Phone:</p>
                    <p className="text-lg font-mono bg-white dark:bg-gray-800 p-2 rounded">{settings.phone}</p>
                  </div>
                )}
                {settings.email && (
                  <div>
                    <p className="font-semibold mb-1">Send to Email (Alternative):</p>
                    <p className="text-lg font-mono bg-white dark:bg-gray-800 p-2 rounded">{settings.email}</p>
                  </div>
                )}
                {settings.instructions && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm">{settings.instructions}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod.method === 'cashapp' && (
              <div className="space-y-4">
                {settings.logo_url && (
                  <Image src={settings.logo_url} alt="CashApp" width={100} height={50} className="mb-4" />
                )}
                {settings.qr_code_url && (
                  <div className="flex justify-center">
                    <Image src={settings.qr_code_url} alt="CashApp QR" width={200} height={200} className="rounded-lg" />
                  </div>
                )}
                {settings.cashtag && (
                  <div>
                    <p className="font-semibold mb-1">Send to Cashtag:</p>
                    <p className="text-2xl font-bold font-mono bg-white dark:bg-gray-800 p-3 rounded text-center">
                      {settings.cashtag}
                    </p>
                  </div>
                )}
                {settings.instructions && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm">{settings.instructions}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod.method === 'cash' && (
              <div className="text-center">
                <p className="text-lg">No action needed. Pay when you arrive or when the delivery driver arrives.</p>
              </div>
            )}
          </div>

          {/* Upload Proof Section */}
          {(paymentMethod.method === 'zelle' || paymentMethod.method === 'cashapp') && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Upload Payment Proof</h3>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  {proofUrl ? (
                    <div className="space-y-4">
                      <Image src={proofUrl} alt="Proof" width={300} height={300} className="mx-auto rounded-lg" />
                      <button
                        onClick={() => {
                          setProofFile(null)
                          setProofUrl('')
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold mb-2">Click to upload screenshot</p>
                      <p className="text-sm text-gray-500">PNG, JPG, or PDF (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Additional Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                  rows={4}
                  placeholder="Any additional information about your payment..."
                />
              </div>

              <button
                onClick={submitProof}
                disabled={!proofFile || submitting || uploading}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting || uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    {uploading ? 'Uploading...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    Submit Payment Proof
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p className="text-sm text-center text-gray-500">
                Your order will be confirmed once payment is verified by our team.
              </p>
            </div>
          )}

          {/* Cash - No upload needed */}
          {paymentMethod.method === 'cash' && (
            <div className="text-center">
              <button
                onClick={() => router.push(`/thank-you/${orderId}`)}
                className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Continue to Confirmation
                <ArrowRight size={20} className="inline ml-2" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}
