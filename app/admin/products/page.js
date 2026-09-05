'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    price: '',
    sellingPrice: '',
    quantity: '',
    unit: '', // NEW: e.g., 'kg', 'litre', 'day', 'hour', 'piece', 'bag'
    bulkDiscount: '', // NEW: e.g., '10' for 10% discount
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const params = searchQuery ? `?q=${searchQuery}` : '?limit=1000'
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/products/search${params}`
      )
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/admin/products`,
        {
          name: formData.name,
          description: formData.description,
          brand: formData.brand,
          price: parseFloat(formData.price),
          sellingPrice: parseFloat(formData.sellingPrice),
          quantity: parseInt(formData.quantity),
          unit: formData.unit, // SEND unit to API
          bulkDiscount: parseFloat(formData.bulkDiscount || 0), // SEND bulk discount to API
        }
      )
      alert('Product created successfully!')
      setFormData({ 
        name: '', 
        description: '', 
        brand: '', 
        price: '', 
        sellingPrice: '', 
        quantity: '',
        unit: '',
        bulkDiscount: '',
      })
      setShowForm(false)
      fetchProducts()
    } catch (error) {
      alert('Error creating product: ' + error.message)
    }
  }

  const toggleProductVisibility = async (productId, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/admin/products/${productId}/toggle`,
        { isActive: !currentStatus }
      )
      alert('Product visibility updated!')
      fetchProducts()
    } catch (error) {
      alert('Error updating product: ' + error.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Close' : '+ Add Product'}
        </button>
      </div>

      {/* Create Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* Brand */}
            <input
              type="text"
              placeholder="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary md:col-span-2"
              rows="3"
            />

            {/* MRP Price */}
            <input
              type="number"
              placeholder="MRP Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* Selling Price (with GST) */}
            <input
              type="number"
              placeholder="Selling Price (with GST)"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* Quantity in Stock */}
            <input
              type="number"
              placeholder="Quantity in Stock"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* NEW: Unit */}
            <input
              type="text"
              placeholder="Unit (kg, litre, day, hour, piece, bag, meter, etc.)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* NEW: Bulk Discount Percentage */}
            <input
              type="number"
              placeholder="Bulk Discount % (e.g., 10 for 10% off)"
              value={formData.bulkDiscount}
              onChange={(e) => setFormData({ ...formData, bulkDiscount: e.target.value })}
              step="0.01"
              min="0"
              max="100"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />

            {/* Submit Button */}
            <button
              onClick={handleCreateProduct}
              className="btn-primary md:col-span-2"
            >
              Create Product
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={() => fetchProducts()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No products found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Brand</th>
                <th className="px-6 py-3 text-left font-semibold">Price</th>
                <th className="px-6 py-3 text-left font-semibold">Unit</th>
                <th className="px-6 py-3 text-left font-semibold">Stock</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.description?.substring(0, 50)}</div>
                  </td>
                  <td className="px-6 py-4">{product.brand || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="text-primary font-bold">₹{product.selling_price}</div>
                    {product.price > product.selling_price && (
                      <div className="text-xs text-gray-500 line-through">₹{product.price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {product.unit || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.quantity_in_stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity_in_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_active ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleProductVisibility(product.id, product.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        product.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {product.is_active ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
