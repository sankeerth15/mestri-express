'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    // TODO: Load from state/API
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const gst = subtotal * 0.18
  const deliveryCharge = subtotal < 500 ? 50 : 0
  const total = subtotal + gst + deliveryCharge

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ))
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container py-20 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some materials to get started</p>
            <Link href="/products" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden">
                {cartItems.map(item => (
                  <div key={item.id} className="border-b p-4 flex gap-4 hover:bg-gray-50">
                    <div className="bg-gray-200 w-20 h-20 rounded flex items-center justify-center flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.brand}</p>
                      <div className="text-primary font-bold mt-2">₹{item.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center border rounded"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 h-fit">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : ''}>
                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center block">
                Proceed to Checkout
              </Link>
              <Link href="/products" className="btn-outline w-full text-center block mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
