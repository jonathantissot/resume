import profile from '../data/profile.json'
import ResumePDFButton from './ResumePDF'

export default function Hero() {
  const calculateAge = () => {
    const birthDate = new Date(profile.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="pt-24 pb-10">
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {profile.title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-10">
            {calculateAge()} years old • {profile.location}
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {profile.headerLinks.filter((link) => link.enabled === true).map((link) => (
              <a
                key={link.name}
                href={link.url}
                target={link.download ? undefined : '_blank'}
                rel={link.download ? undefined : 'noopener noreferrer'}
                download={link.download}
                className={`social-button ${link.name.toLowerCase().replace(/\s+/g, '-')} flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 hover:scale-110`}
                title={link.ariaLabel}
                aria-label={link.ariaLabel}
              >
                <i className={`${link.iconPrefix} ${link.icon} text-xl`}></i>
              </a>
            ))}
          </div>

          {/* One-Pager PDF Download */}
          <ResumePDFButton />
        </div>
      </div>
    </div>
  )
}
