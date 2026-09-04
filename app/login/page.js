'use client'

import { useState } from 'react'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/auth/send-otp`,
        { phone }
      )
      setStep(2)
    } catch (error) {
      alert('Error sending OTP: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/auth/verify-otp`,
        { phone, otp }
      )
      localStorage.setItem('user', JSON.stringify(response.data.user))
      alert('Login successful!')
      // TODO: Redirect to home
    } catch (error) {
      alert('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-light-green to-light-orange flex items-center">
        <div className="container">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-primary">Mestri-Express</h1>
            <p className="text-gray-600 text-center mb-8">Quick delivery. Fast checkout.</p>

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your 10-digit phone number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={phone.length !== 10 || loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  We've sent an OTP to <strong>{phone}</strong>
                </p>
                <div>
                  <label className="block font-medium mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-center text-2xl tracking-widest"
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={() => {
                    setStep(1)
                    setOtp('')
                  }}
                  className="btn-outline w-full"
                >
                  Change Phone
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
