'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/categories`
      )
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-dark-green text-white py-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6">Construction Materials Delivered in 60 Minutes</h1>
                <p className="text-xl mb-8 opacity-90">
                  Quality materials at wholesale prices. Fast delivery. No hassle.
                </p>
                <Link href="/products" className="btn-secondary inline-block">
                  Shop Now
                </Link>
              </div>
              <div className="text-center">
                <div className="bg-white text-primary rounded-lg p-8 shadow-lg">
                  <div className="text-4xl font-bold mb-2">60</div>
                  <div className="text-lg font-semibold">Minutes Delivery</div>
                  <div className="text-sm text-gray-600 mt-4">Across Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Mestri-Express?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: '60-minute delivery' },
                { icon: '💰', title: 'Best Prices', desc: 'Wholesale rates' },
                { icon: '🤝', title: 'Reliable', desc: 'On-time delivery' },
                { icon: '📱', title: 'Easy Ordering', desc: 'Simple checkout' },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12">Shop by Category</h2>
            {loading ? (
              <div className="text-center">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="bg-light-green hover:bg-primary hover:text-white p-6 rounded-lg text-center transition font-semibold"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-white py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-xl mb-8 opacity-90">
              Browse thousands of construction materials at wholesale prices
            </p>
            <Link href="/products" className="btn-secondary">
              Start Shopping
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
