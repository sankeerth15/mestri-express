'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function ProductDetail() {
  const params = useParams()
  const { id } = params
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/products/${id}`
      )
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20">Loading...</div>
  if (!product) return <div className="text-center py-20">Product not found</div>

  const handleAddToCart = () => {
    alert(`Added ${quantity} of ${product.name} to cart!`)
    // TODO: Add to actual cart
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <Link href="/products" className="text-primary hover:underline mb-6 inline-block">
            ← Back to Products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-lg">
            {/* Image */}
            <div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg">
              <div className="text-6xl">📦</div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b">
                <div className="text-4xl font-bold text-primary mb-2">₹{product.selling_price}</div>
                {product.price > product.selling_price && (
                  <div className="text-lg text-gray-500 line-through">₹{product.price}</div>
                )}
                <div className="text-sm text-gray-600 mt-2">GST Included</div>
              </div>

              {/* Info */}
              <div className="space-y-4 mb-8 pb-8 border-b">
                <div>
                  <span className="font-bold">Brand:</span> {product.brand || 'N/A'}
                </div>
                <div>
                  <span className="font-bold">Stock:</span> {product.quantity_in_stock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <div>
                  <span className="font-bold">Return Policy:</span> {product.return_policy}
                </div>
              </div>

              {/* Bulk Pricing */}
              {product.bulkPricing && product.bulkPricing.length > 0 && (
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-bold mb-4">Bulk Pricing</h3>
                  <div className="space-y-2">
                    {product.bulkPricing.map((bp, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        Buy {bp.min_quantity}+ → {bp.discount_percent}% off
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity_in_stock === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
