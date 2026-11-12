import { Dumbbell, Crown, Gamepad2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import copy from '../../../data/site.json';
const icons = { Dumbbell, Crown, Gamepad2 };
export default function Hobbies() {
  return <PageWrapper className="max-w-5xl">
    <h1 className="page-title">{copy.hobbies.title}</h1>
    <div className="prose-sections">{copy.hobbies.sections.map(section => {
      const Icon = icons[section.icon as keyof typeof icons];
      return <section key={section.title}><h2><Icon size={24} />{section.title}</h2><p>{section.content}</p></section>;
    })}</div>
  </PageWrapper>;
}
