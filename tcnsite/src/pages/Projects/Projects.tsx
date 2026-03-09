import { motion } from 'framer-motion';
import { Github, Play } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import projects from '../../../data/projects.json';

const tagColors: Record<string, string> = {
  Rust: '#dea584',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Lua: '#000080',
  Svelte: '#ff3e00',
  Unity: '#888888',
  'C#': '#68217a',
  Aseprite: '#7d929e',
  playwright: '#2EAD33',
  SQLite: '#003B57',
  Markdown: '#083fa1',
};

export default function Projects() {
  return (
    <PageWrapper className="max-w-5xl">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-10"
        style={{ color: "var(--color-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        My projects
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {projects.map((project, i) => (
          <motion.div
            key={project.projectName}
            className="rounded-xl p-6 flex flex-col justify-between transition-colors duration-200"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  {project.projectName}
                </h2>
                <div className="flex gap-2 ml-3 shrink-0">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.projectName} GitHub`}
                      className="p-1.5 rounded-md transition-colors duration-200"
                      style={{ color: "var(--color-text-muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
                    >
                      <Github size={18} />
                    </a>
                  )}
                  {project.demoLink && (
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.projectName} Demo`}
                      className="p-1.5 rounded-md transition-colors duration-200"
                      style={{ color: "var(--color-text-muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
                    >
                      <Play size={18} />
                    </a>
                  )}
                </div>
              </div>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "var(--color-text-muted)" }}
              >
                {project.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: (tagColors[tag] ?? '#888') + '30',
                    color: tagColors[tag] ?? '#888',
                    border: `1px solid ${(tagColors[tag] ?? '#888')}50`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}