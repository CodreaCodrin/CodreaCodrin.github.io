import { useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import ReturnHome from '../navigation/ReturnHome';
export default function PageWrapper({ children, className = '', outerContent }: {
  children: ReactNode; className?: string; outerContent?: ReactNode;
}) {
  const home = useLocation({ select: location => location.pathname === '/' });
  return <div className="page-wrapper">
    <div className={`page-panel ${className}`}>
      {!home && <div className="page-return"><ReturnHome /></div>}
      {children}
    </div>
    {outerContent}
  </div>;
}
