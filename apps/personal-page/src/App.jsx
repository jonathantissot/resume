import { useEffect } from 'react'
import { initializeApp } from './services/analytics'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import SkillsSection from './components/SkillsSection'
import EducationSection from './components/EducationSection'
import CertificationsSection from './components/CertificationsSection'
import ExperienceSection from './components/ExperienceSection'
import AchievementsSection from './components/AchievementsSection'
import RecommendationsSection from './components/RecommendationsSection'
import Footer from './components/Footer'

function App() {
  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        <HeroSection />
        <SkillsSection />
        <CertificationsSection />
        <ExperienceSection />
        <EducationSection />
        <AchievementsSection />
        <RecommendationsSection />
      </div>
      <Footer />
    </>
  )
}

export default App
