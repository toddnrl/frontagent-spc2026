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

      <Hero />
      <Features />
      <Functions titleVariant="rules" />
      <Functions titleVariant="knowledge" />
      <Functions titleVariant="tasks" />
      <Advantages />
      <Evaluation />
      <Dashboard />
      <DevSection />
      <Footer />

      <ScrollTopButton />
    </>
  )
}
