'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dark-green text-white transition-all duration-300`}>
        <div className="p-6 border-b border-gray-700">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-sm'}`}>
            {sidebarOpen ? 'Mestri-Express' : 'ME'}
          </h1>
          <p className={`text-gray-400 text-xs mt-1 ${sidebarOpen ? '' : 'hidden'}`}>Admin</p>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { href: '/admin', label: 'Dashboard', icon: '📊' },
            { href: '/admin/products', label: 'Products', icon: '📦' },
            { href: '/admin/orders', label: 'Orders', icon: '🛒' },
            { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
            { href: '/admin/team', label: 'Team', icon: '👥' },
            { href: '/admin/labour', label: 'Labour', icon: '💰' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary transition text-sm"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary rounded-lg"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-primary">🔔</button>
            <button className="text-gray-600 hover:text-primary">⚙️</button>
            <button className="text-gray-600 hover:text-primary">👤</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
