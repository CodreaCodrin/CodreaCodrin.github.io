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
      'I started playing chess six years ago and have kept playing daily but i made very little progress since I\'ve never got to study openings or strategies. Playing is still fun even after thousands of games and competing with my father and my friends will never let me abandon this game.',
  },
  {
    icon: Gamepad2,
    title: 'Gaming',
    content:
      'I\'ve played a huge variety of games across every genre — especially metroidvanias, soulslikes, roguelikes and competitive games. I\'m really into fast-paced games that push my reaction time to the limit. For me, the overall experience is key, so I pay close attention to the soundtrack, atmosphere, and visual style (except competitive games of course, where there are other criteria).',
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