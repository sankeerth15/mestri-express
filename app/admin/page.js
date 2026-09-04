'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todaysOrders: 0,
    todaysRevenue: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mestri-express.vercel.app'}/api/admin/dashboard/stats`
      )
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { 
            label: "Today's Orders", 
            value: stats.todaysOrders, 
            icon: '🛒',
            color: 'bg-blue-100 text-blue-600'
          },
          { 
            label: "Today's Revenue", 
            value: `₹${stats.todaysRevenue.toFixed(0)}`, 
            icon: '💰',
            color: 'bg-green-100 text-green-600'
          },
          { 
            label: 'Pending Orders', 
            value: stats.pendingOrders, 
            icon: '⏳',
            color: 'bg-orange-100 text-orange-600'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', href: '/admin/products', icon: '➕' },
            { label: 'View Orders', href: '/admin/orders', icon: '📋' },
            { label: 'Analytics', href: '/admin/analytics', icon: '📊' },
            { label: 'Team Members', href: '/admin/team', icon: '👥' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="border-2 border-gray-200 p-4 rounded-lg hover:border-primary hover:bg-light-green text-center transition"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-medium text-sm">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3">Order ID</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-primary">ORD-20260905-{String(i).padStart(3, '0')}</td>
                  <td className="p-3">Customer {i}</td>
                  <td className="p-3 font-bold">₹{(Math.random() * 5000 + 1000).toFixed(0)}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Delivered
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{i} hours ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/admin/orders" className="text-primary hover:underline mt-4 inline-block">
          View all orders →
        </Link>
      </div>
    </div>
  )
}
