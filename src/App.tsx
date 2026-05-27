// ─── APP ROOT — SixDX ────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { initScroll, destroyScroll } from './animations/scroll'
import Preloader     from './components/ui/Preloader'
import Navbar        from './components/layout/Navbar'
import Hero          from './components/sections/Hero'
import StackSection  from './components/sections/StackSection'
import AboutSection  from './components/sections/AboutSection'
import WorkSection          from './components/sections/WorkSection'
import HowSixDXWorks        from './components/sections/HowSixDXWorks'
import WhatWeCreateSection  from './components/sections/WhatWeCreateSection'
import ContactSection        from './components/sections/ContactSection'
import FooterSection         from './components/layout/FooterSection'

export default function App() {
  // ── Lenis smooth scroll init ───────────────────────────────────────────
  useEffect(() => {
    initScroll()
    return () => destroyScroll()
  }, [])

  return (
    <main className="relative bg-[#0a0a0a]">
      <Preloader />
      <Navbar />
      <Hero />
      <StackSection />
      <AboutSection />
      <WorkSection />
      <HowSixDXWorks />
      <WhatWeCreateSection />
      <ContactSection />
      <FooterSection />
    </main>
  )
}
