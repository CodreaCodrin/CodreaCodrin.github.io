import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import OnPageNavButton from '../../components/navigation/onPageNavButton';
import SocialLinks from '../../components/navigation/SocialLinks';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useDiscoveryEffect } from '../../hooks/useDiscoveryEffect';
import copy from '../../../data/site.json';
import discovery from '../../../data/discovery.json';
export default function Home() {
  const [greeting] = useState(() => copy.home.greetings[Math.floor(Math.random() * copy.home.greetings.length)]);
  const { unlocked } = useDiscovery();
  const ref = useDiscoveryEffect<HTMLDivElement>();
  const found = discovery.items.filter(item => unlocked.includes(item.id));
  return <div ref={ref}><PageWrapper className="max-w-3xl" outerContent={<SocialLinks />}>
    <section className="home-hero">
      <h1>{greeting}</h1>
      <p>{copy.home.intro.map((part, index) => part.path
        ? <Link key={index} to={part.path}>{part.text}</Link> : <span key={index}>{part.text}</span>)}</p>
    </section>
    <hr className="home-divider" />
    <section className="home-navigation" aria-label={copy.navigationLabel}>
      {copy.navigation.filter(item => item.home).map(item => <OnPageNavButton key={item.path} {...item} />)}
    </section>
    {found.length > 0 && <section className="discovered-section">
      <p className="eyebrow">{copy.home.discoveredLabel}</p>
      <div className="home-navigation">{found.map(item => <motion.div key={item.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <OnPageNavButton {...item} discovered />
      </motion.div>)}</div>
    </section>}
    <p className="discovery-hint">{copy.home.discoveryHint}</p>
  </PageWrapper></div>;
}
