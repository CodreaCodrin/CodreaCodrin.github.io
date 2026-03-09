import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@example.com", label: "Email" },
];

export default function Contact() {
  return (
    <PageWrapper className="max-w-xl">
      <motion.h1
        className="text-6xl md:text-7xl font-extrabold text-center"
        style={{ color: "var(--color-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Contact me
      </motion.h1>

      <section className="flex justify-center gap-12 mt-10">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <motion.a
            key={label}
            layoutId={`social-${label}`}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={label}
            className="p-3 rounded-full transition-colors duration-200"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            <Icon size={28} />
          </motion.a>
        ))}
      </section>
    </PageWrapper>
  );
}