import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  outerContent?: ReactNode;
}

export default function PageWrapper({ children, className = '', outerContent }: PageWrapperProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <motion.div
        layoutId="page-container"
        className={`rounded-2xl px-12 py-14 w-full flex flex-col items-center ${className}`}
        style={{
          backgroundColor: "rgba(17, 17, 17, 0.85)",
          backdropFilter: "blur(8px)",
        }}
        transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
      >
        {children}
      </motion.div>
      {outerContent}
    </div>
  );
}
