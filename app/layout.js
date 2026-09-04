import './globals.css'

export const metadata = {
  title: 'Mestri-Express - Quick Construction Material Delivery',
  description: 'Same-day delivery of construction materials in Bangalore',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
