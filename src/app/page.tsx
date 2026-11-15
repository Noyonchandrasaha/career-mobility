import { PublicHeader } from "@/components/home/public-header"
import { HeroSection } from "@/components/home/hero-section"
import { HowItWorks, PrototypeNote } from "@/components/home/how-it-works"
import { PublicFooter } from "@/components/home/public-footer"

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <HeroSection />
        <HowItWorks />
        <PrototypeNote />
      </main>
      <PublicFooter />
    </>
  )
}
