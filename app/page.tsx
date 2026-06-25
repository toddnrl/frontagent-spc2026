import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Functions from '@/components/Functions'
import Advantages from '@/components/Advantages'
import Evaluation from '@/components/EvaluationSection'
import Dashboard from '@/components/Dashboard'
import DevSection from '@/components/DevSection'
import Footer from '@/components/Footer'

import ScrollEffects from '@/components/ScrollEffects'
import ScrollTopButton from '@/components/ScrollTopButton'

export default function Home() {
  return (
    <>
      <ScrollEffects />
      <Header />

      {/* SECTION 1: Hero */}
      <Hero />
    
      {/* SECTION 2: Features */}
      <div className="full-page-section">
        <Features />
      </div>

      {/* Section 3: Functions */}
      <div className="full-page-section">
        <Functions titleVariant="rules" />
      </div>

      {/* Knowledge */}
      <div className="full-page-section">
        <Functions titleVariant="knowledge" />
      </div>

      {/* Tasks */}
      <div className="full-page-section">
        <Functions titleVariant="tasks" />
      </div>

      {/* Section 4: Advantages */}
      <div className="full-page-section">
        <Advantages />
      </div>

      {/* Section 5: Evaluation */}
      <div className="full-page-section evaluation-section-gap">
        <Evaluation />
      </div>

      {/* Section 6: Dashboard */}
      <div className="full-page-section dashboard-section">
        <Dashboard />
      </div>

      {/* Section 7: Developer Ecosystem */}
      <div className="full-page-section">
        <DevSection />
      </div>

      {/* Footer */}
      <div style={{ scrollSnapAlign: 'start' }}>
        <Footer />
      </div>

      <ScrollTopButton />
    </>
  )
}
