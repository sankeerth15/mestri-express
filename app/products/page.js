'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000 })

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, priceFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        q: searchQuery,
        minPrice: priceFilter.min,
        maxPrice: priceFilter.max,
        limit: 50,
      })
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/products/search?${params}`
      )
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-8">Construction Materials</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="bg-white p-6 rounded-lg h-fit">
              <h3 className="font-bold text-lg mb-6">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="number"
                      value={priceFilter.min}
                      onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={priceFilter.max}
                      onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No products found. Try different filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        <div className="text-4xl">📦</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg line-clamp-2 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">₹{product.selling_price}</div>
                            {product.price > product.selling_price && (
                              <div className="text-xs text-gray-500 line-through">₹{product.price}</div>
                            )}
                          </div>
                          <div className="bg-light-green text-primary px-3 py-1 rounded text-sm font-medium">
                            Add
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
