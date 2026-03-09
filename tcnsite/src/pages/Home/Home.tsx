import { useNavigate } from "@tanstack/react-router";
import OnPageNavButton from "../../components/navigation/onPageNavButton";
import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

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

export default function Home() {
  const navigate = useNavigate();
  const [selectedGreeting, setSelectedGreeting] = useState<string>("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * GREETINGS.length);
    setSelectedGreeting(GREETINGS[randomIndex]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div
        className="rounded-2xl px-12 py-14 max-w-3xl w-full flex flex-col items-center"
        style={{ backgroundColor: "rgba(17, 17, 17, 0.85)", backdropFilter: "blur(8px)" }}
      >
        {/* Hero */}
        <section className="w-full mb-14 text-center">
          <h1
            className="text-6xl md:text-7xl font-extrabold mb-8"
            style={{ color: "var(--color-primary)" }}
          >
            {selectedGreeting}
          </h1>

          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            I'm{" "}
            <span
              onClick={() => navigate({ to: "/aboutme" })}
              className="font-semibold cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              Teodosie Codrin
            </span>
            , a Computer Science student that enjoys building{" "}
            <span
              onClick={() => navigate({ to: "/projects" })}
              className="font-semibold cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              things
            </span>
            . I'm especially drawn to game development and the{" "}
            <span
              onClick={() => navigate({ to: "/hobbies" })}
              className="font-semibold cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              gaming world
            </span>
            , where
            I feel most at home as a creator. Outside of my projects, I'm always
            involved in a lot of different{" "}
            <span
              onClick={() => navigate({ to: "/hobbies" })}
              className="font-semibold cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              sports
            </span>
            . Beyond those, maintaining an
            athletic routine is my way of staying competitive and active.
          </p>
        </section>

        {/* Divider */}
        <hr
          className="w-full mb-10"
          style={{ borderColor: "var(--color-border)" }}
        />

        {/* Nav buttons */}
        <section className="flex flex-wrap justify-center gap-8">
          {navButtons.map((btn) => (
            <OnPageNavButton
              key={btn.path}
              title={btn.title}
              text={btn.text}
              onClick={() => navigate({ to: btn.path })}
            />
          ))}
        </section>
      </div>

      {/* Social links */}
      <section className="flex justify-center gap-12 mt-8">
        {[
          { icon: Github, href: "https://github.com", label: "GitHub" },
          { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
          { icon: Mail, href: "mailto:contact@example.com", label: "Email" },
        ].map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={label}
            className="p-3 rounded-full transition-all duration-200"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            <Icon size={28} />
          </a>
        ))}
      </section>
    </div>
  );
}
