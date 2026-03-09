import { motion } from 'framer-motion';
import { Dumbbell, Crown, Gamepad2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const sections = [
  {
    icon: Dumbbell,
    title: 'Sport',
    content:
      'Currently I practice kickboxing and bouldering on a regular basis. Over the years I\'ve also been involved in swimming, football, padel, tennis, billiards, basketball and strength training.',
  },
  {
    icon: Crown,
    title: 'Chess',
    content:
      'Chess is the one game where I can sit still and still feel like I\'m competing. I enjoy studying openings, solving puzzles and playing rapid games whenever I get the chance.',
  },
  {
    icon: Gamepad2,
    title: 'Gaming',
    content:
      'I\'ve played a huge variety of games across every genre — from competitive shooters and strategy titles to story-driven RPGs and indie gems. Gaming has always been a creative outlet and a constant source of inspiration for my own projects.',
  },
];

export default function Hobbies() {
  return (
    <PageWrapper className="max-w-5xl">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-12"
        style={{ color: 'var(--color-primary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        My hobbies
      </motion.h1>

      <div className="flex flex-col w-full">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
          >
            {i > 0 && (
              <hr className="w-full mb-8" style={{ borderColor: 'var(--color-border)' }} />
            )}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <section.icon size={24} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {section.title}
                </h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}