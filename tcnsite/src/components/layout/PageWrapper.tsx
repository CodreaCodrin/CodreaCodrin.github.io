import { motion } from 'framer-motion';
import { useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import ReturnHome from '../navigation/ReturnHome';
export default function PageWrapper({ children, className = '', outerContent }: {
  children: ReactNode; className?: string; outerContent?: ReactNode;
}) {
  const home = useLocation({ select: location => location.pathname === '/' });
  return <div className="page-wrapper">
    <motion.div layout className={`page-panel ${className}`} transition={{ layout: { duration: 0.35 } }}>
      {!home && <div className="page-return"><ReturnHome /></div>}
      {children}
    </motion.div>
    {outerContent}
  </div>;
}
