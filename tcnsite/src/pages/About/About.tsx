import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';

export default function About() {
  return (
    <PageWrapper className="max-w-5xl">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-12"
        style={{ color: 'var(--color-primary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        About me
      </motion.h1>

      <motion.p
        className="text-lg leading-relaxed mb-8"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        I am currently an intern at NTT DATA, doing unit testing on projects.
      </motion.p>

      <hr className="w-full mb-8" style={{ borderColor: 'var(--color-border)' }} />

      <motion.p
        className="text-lg leading-relaxed mb-8"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        I have a strong passion for networking, specifically the design and implementation of physical network infrastructure. I find great satisfaction in building and organizing hardware-level systems.
      </motion.p>

      <hr className="w-full mb-8" style={{ borderColor: 'var(--color-border)' }} />

      <motion.p
        className="text-lg leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
      >
        Opel love  &#60;3.
      </motion.p>
    </PageWrapper>
  );
}