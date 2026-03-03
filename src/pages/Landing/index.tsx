import Box from '@mui/material/Box';
import AuthoritySection from './components/AuthoritySection';
import BenefitsSection from './components/BenefitsSection';
import CallToAction from './components/CallToAction';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import ObjectionsSection from './components/ObjectionsSection';
import PainSection from './components/PainSection';
import PortfolioSection from './components/Portfolio';
import TestimonialsSection from './components/TestimonialsSection';
import FeaturesSection from './components/Features';

/**
 * Landing page orientada a conversão (leads via Instagram).
 * Público: mulheres 30+ (emagrecimento, baixa adesão à academia).
 * Estrutura: Hero → Dor → Autoridade → Benefícios → Objeções → Depoimentos → CTA → Contato.
 */
export default function Landing() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Hero />
      <PainSection />
      <AuthoritySection />
      <BenefitsSection />
      <ObjectionsSection />
      <PortfolioSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CallToAction />
      <Contact />
      <Footer />
    </Box>
  );
}
