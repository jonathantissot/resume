import BadgeMosaic from './BadgeMosaic'
import Hero from './Hero'
import ProfileSummary from './ProfileSummary'

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <BadgeMosaic />
      <div className="relative z-10">
        <Hero />
        <ProfileSummary />
      </div>
    </div>
  )
}
