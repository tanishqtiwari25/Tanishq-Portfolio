import ScrollExperience from '@/components/ScrollExperience';
import ThreeBackground from '@/components/ThreeBackground';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import EducationCertifications from '@/components/EducationCertifications';
import GitHubStats from '@/components/GitHubStats';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <a className="skip-link" href="#about">Skip to content</a>
      <ThreeBackground />
      <ScrollExperience />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <EducationCertifications />
      <GitHubStats />
      <Contact />
      <Footer />
    </main>
  );
}