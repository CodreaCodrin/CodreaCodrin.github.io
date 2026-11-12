import { useNavigate } from "@tanstack/react-router";
import OnPageNavButton from "../../components/navigation/onPageNavButton";
import { useState, useEffect, useCallback } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';

const navButtons = [
  { title: "Ab", text: "about", path: "/aboutme" },
  { title: "Pr", text: "projects", path: "/projects" },
  { title: "Ho", text: "hobbies", path: "/hobbies" },
  { title: "Ct", text: "contact", path: "/contactme" },
] as const;

const GREETINGS: string[] = [
  "Hai să trăiești!",
  "Salut salut!",
  "Hi!",
  "Hello!"
];

const socialLinks = [
  { icon: Github, href: "https://github.com/CodreaCodrin", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/teodosiecodrin/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:codrinteodosie@gmail.com", label: "Email" },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedGreeting, setSelectedGreeting] = useState<string>("");
  const [exiting, setExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * GREETINGS.length);
    setSelectedGreeting(GREETINGS[randomIndex]);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    if (exiting) return;
    setExiting(true);
    setExitTarget(path);
  }, [exiting]);

  // Navigate after exit animation completes
  useEffect(() => {
    if (exiting && exitTarget) {
      const timer = setTimeout(() => {
        navigate({ to: exitTarget });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [exiting, exitTarget, navigate]);

  const socialSection = (
    <section className="flex justify-center gap-12 mt-8">
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
  );

  return (
    <PageWrapper className="max-w-3xl" outerContent={socialSection}>
      {/* Hero */}
      <section className="w-full mb-14 text-center">
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold mb-8"
          style={{ color: "var(--color-primary)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: exiting ? 0 : 1, y: exiting ? -20 : 0 }}
          transition={{ duration: 0.4, delay: exiting ? 0 : 0.2 }}
        >
          {selectedGreeting}
        </motion.h1>

        <motion.p
          className="text-lg leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: exiting ? 0 : 1, y: exiting ? -20 : 0 }}
          transition={{ duration: 0.4, delay: exiting ? 0.08 : 0.35 }}
        >
          I'm{" "}
          <span
            onClick={() => handleNavigate("/aboutme")}
            className="font-semibold cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            Teodosie Codrin
          </span>
          , a Computer Science student that enjoys building{" "}
          <span
            onClick={() => handleNavigate("/projects")}
            className="font-semibold cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            things
          </span>
          . I love solving my own everyday annoyances by building custom apps and{" "}
          <span
            onClick={() => handleNavigate("/hobbies")}
            className="font-semibold cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
           small tools 
          </span>
          {" "}from scratch. Outside of my projects, I'm always
          involved in a lot of different{" "}
          <span
            onClick={() => handleNavigate("/hobbies")}
            className="font-semibold cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            sports
          </span>
          . Beyond those, maintaining an
          athletic routine is my way of staying competitive and active.
        </motion.p>
      </section>

      {/* Divider */}
      <motion.hr
        className="w-full mb-10"
        style={{ borderColor: "var(--color-border)" }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: exiting ? 0 : 1, scaleX: exiting ? 0 : 1 }}
        transition={{ duration: 0.4, delay: exiting ? 0.15 : 0.5 }}
      />

      {/* Nav buttons */}
      <motion.section
        className="flex flex-wrap justify-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? 20 : 0 }}
        transition={{ duration: 0.4, delay: exiting ? 0.22 : 0.6 }}
      >
        {navButtons.map((btn) => (
          <OnPageNavButton
            key={btn.path}
            title={btn.title}
            text={btn.text}
            onClick={() => handleNavigate(btn.path)}
          />
        ))}
      </motion.section>
    </PageWrapper>
  );
}
