import PageWrapper from '../../components/layout/PageWrapper';
import copy from '../../../data/site.json';
export default function About() {
  return <PageWrapper className="max-w-5xl">
    <h1 className="page-title">{copy.about.title}</h1>
    <div className="prose-sections">{copy.about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
  </PageWrapper>;
}
