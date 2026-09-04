'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CheckoutPage() {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Confirmation
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [siteIncharge, setSiteIncharge] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [loading, setLoading] = useState(false)

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      // TODO: Create order via API
      alert('Order placed successfully!')
      setStep(3)
    } catch (error) {
      alert('Error placing order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container py-12">
          {/* Progress */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 ${s <= step ? 'text-primary' : 'text-gray-400'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    s <= step ? 'bg-primary text-white border-primary' : 'border-gray-300'
                  }`}>
                    {s}
                  </div>
                  <span className="font-medium">
                    {s === 1 ? 'Address' : s === 2 ? 'Payment' : 'Confirmation'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Site Incharge Phone (Optional)</label>
                    <input
                      type="tel"
                      value={siteIncharge}
                      onChange={(e) => setSiteIncharge(e.target.value)}
                      placeholder="For on-site coordination"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!phone || !address}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  <label className="border-2 p-4 rounded-lg cursor-pointer hover:border-primary" style={{ borderColor: paymentMethod === 'razorpay' ? '#50AD41' : '#ccc' }}>
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">Pay Now with Razorpay</span>
                    <p className="text-gray-600 text-sm mt-1">Secure card, UPI, or net banking</p>
                  </label>

                  <label className="border-2 p-4 rounded-lg cursor-pointer hover:border-primary" style={{ borderColor: paymentMethod === 'cod' ? '#50AD41' : '#ccc' }}>
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">Pay on Delivery</span>
                    <p className="text-gray-600 text-sm mt-1">Pay when order arrives</p>
                  </label>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary flex-1"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Review Order</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="pb-4 border-b">
                    <h3 className="font-bold mb-2">Delivery Address</h3>
                    <p className="text-gray-600">{address}</p>
                  </div>

                  <div className="pb-4 border-b">
                    <h3 className="font-bold mb-2">Payment Method</h3>
                    <p className="text-gray-600">
                      {paymentMethod === 'razorpay' ? 'Pay Now with Razorpay' : 'Pay on Delivery'}
                    </p>
                  </div>

                  <div className="bg-light-green p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>₹5,000</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>GST (18%)</span>
                      <span>₹900</span>
                    </div>
                    <div className="flex justify-between text-primary font-bold text-lg">
                      <span>Total</span>
                      <span>₹5,900</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
