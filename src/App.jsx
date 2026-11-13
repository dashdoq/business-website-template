import {
  Billing,
  Business,
  CardDeal,
  CTA,
  Footer,
  Hero,
  InkFilter,
  Navbar,
  Testimonials
} from './components'

const App = () => (
  <>
    <InkFilter />
    <Navbar />
    <main>
      <Hero />
      <Business />
      <Billing />
      <CardDeal />
      <Testimonials />
      <CTA />
    </main>
    <Footer />
  </>
)

export default App
