import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import copy from '../../../data/discovery.json';
import shortcuts from '../../../data/shortcuts.json';
export default function OnPageNavButton({ text, title, path, discovered = false }: {
  text: string; title: string; path: string; discovered?: boolean;
}) {
  return <Link to={path} aria-keyshortcuts={shortcuts.pages.find(item => item.path === path)?.key} className={`nav-tile ${discovered ? 'discovered-tile' : ''}`}>
    <ArrowUpRight className="tile-arrow" size={15} aria-hidden="true" />
    <span className="tile-symbol">{title}</span><span className="tile-label">{text}</span>
    {discovered && <span className="tile-badge">{copy.newLabel}</span>}
  </Link>;
}
