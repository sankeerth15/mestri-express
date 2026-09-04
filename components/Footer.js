export default function Footer() {
  return (
    <footer className="bg-dark-green text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mestri-Express</h3>
            <p className="text-gray-300">
              60-minute delivery of construction materials at wholesale prices.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/products" className="hover:text-white">Shop</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://wa.me/9876543210" className="hover:text-white">WhatsApp</a></li>
              <li><a href="tel:1800123456" className="hover:text-white">Call Us</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/terms" className="hover:text-white">Terms</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
          <p>&copy; 2026 Mestri-Express. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
