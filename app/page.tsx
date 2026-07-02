import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Functions from '@/components/Functions'
import Advantages from '@/components/Advantages'
import Solution from '@/components/Solution'
import Evaluation from '@/components/EvaluationSection'
import Dashboard from '@/components/Dashboard'
import DevSection from '@/components/DevSection'
import Footer from '@/components/Footer'
import ScrollSnap from '@/components/ScrollSnap'

import { FloatingButton } from '@/components/home/FloatingButton'

export default function Home() {
  return (
    <>
      <ScrollSnap />
      <Header />

      <Hero />
      <Advantages />
      {/* <Features /> */}
      <Functions titleVariant="rules" />
      <Functions titleVariant="knowledge" />
      <Functions titleVariant="tasks" />
      <Solution />
      <Evaluation />
      <Dashboard />
      <DevSection />
      <Footer />

      <FloatingButton />
    </>
  )
}
