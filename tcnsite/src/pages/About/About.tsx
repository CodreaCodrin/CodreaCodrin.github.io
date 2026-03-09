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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </motion.p>

      <hr className="w-full mb-8" style={{ borderColor: 'var(--color-border)' }} />

      <motion.p
        className="text-lg leading-relaxed mb-8"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.
      </motion.p>

      <hr className="w-full mb-8" style={{ borderColor: 'var(--color-border)' }} />

      <motion.p
        className="text-lg leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
      >
        Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra auctor nibh.
      </motion.p>
    </PageWrapper>
  );
}