import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import ThemeDropdown from './ThemeDropdown';
import MenuOverlay from './MenuOverlay';
import { useDiscoveryEffect } from '../../hooks/useDiscoveryEffect';
import { useDiscovery } from '../../context/DiscoveryContext';
import copy from '../../../data/site.json';
export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useDiscoveryEffect<HTMLElement>();
  const { unlocked } = useDiscovery();
  return <>
    <nav ref={ref} className="site-nav" aria-label={copy.navigationLabel}>
      <div className="brand-group"><Link to="/" className="brand">{copy.brand}</Link>{'homeHint' in copy && typeof copy.homeHint === 'string' && <span>{copy.homeHint}</span>}</div>
      <div className="toolbar"><ThemeDropdown /><button className="icon-button menu-trigger" onClick={() => setMenuOpen(true)}
        aria-label={copy.openMenu} aria-expanded={menuOpen}><Menu size={19} />{unlocked.length > 0 && <span className="menu-dot" aria-hidden="true" />}</button></div>
    </nav>
    {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
  </>;
}
