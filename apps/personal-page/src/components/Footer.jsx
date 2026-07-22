import profile from '../data/profile.json'
import socialLinks from '../data/socialLinks.json'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Social Networks */}
          <div>
            <h4 className="text-lg font-bold mb-4">Social Networks</h4>
            <div className="flex gap-4">
              {socialLinks.socialLinks.filter((link) => link.enabled === true).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  title={link.ariaLabel}
                  aria-label={link.ariaLabel}
                >
                  <i className={`fa-brands ${link.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Me</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-blue-400"></i>
                <a href={`mailto:${profile.email}`} className="hover:text-blue-400 transition-colors">
                  {profile.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-brands fa-linkedin text-blue-400"></i>
                <a
                  href="https://www.linkedin.com/in/jonathantissot/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-semibold"
                >
                  Connect on LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {currentYear} Jonathan Tissot. All rights reserved.
          </p>
          <p className="text-center text-gray-500 text-xs mt-2">
            Built with React • Tailwind CSS • Analytics powered by Google Analytics 4
          </p>
        </div>
      </div>
    </footer>
  )
}

