import { useState } from 'react'
import profile from '../data/profile.json'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { label: 'Certifications', href: '#certifications' },
    { label: 'Experience', href: '#experience' },
    { label: 'Education', href: '#educourses' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Recommendations', href: '#recommendations' },
  ]

  return (
    <nav className="fixed w-full bg-gray-900 text-white shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">{profile.name}</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-blue-400 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://www.linkedin.com/in/jonathantissot/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors duration-200 font-semibold"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col space-y-1 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-2 hover:text-blue-400 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://www.linkedin.com/in/jonathantissot/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 hover:text-blue-400 transition-colors duration-200 font-semibold"
            >
              Contact
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}

