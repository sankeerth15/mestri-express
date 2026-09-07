'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/categories`
      )
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/admin/categories`,
        { name: formData.name }
      )
      alert('Category created successfully!')
      setFormData({ name: '' })
      setShowForm(false)
      fetchCategories()
    } catch (error) {
      alert('Error creating category: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure? This will delete the category (products will need to be reassigned).')) {
      return
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/admin/categories/${categoryId}`
      )
      alert('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      alert('Error deleting category: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Close' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Category Name (e.g., Civil & Structural)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCreateCategory}
              className="btn-primary"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No categories found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Category Name</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
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
