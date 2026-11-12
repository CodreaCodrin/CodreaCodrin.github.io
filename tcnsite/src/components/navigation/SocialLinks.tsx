import { Github, Linkedin, Mail } from 'lucide-react';
import data from '../../../data/site.json';
const icons = { Github, Linkedin, Mail };
export default function SocialLinks() {
  return <div className="social-links">{data.socialLinks.map(({ icon, href, label }) => {
    const Icon = icons[icon as keyof typeof icons];
    return <a key={label} href={href} aria-label={label} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer"><Icon size={26} /></a>;
  })}</div>;
}
