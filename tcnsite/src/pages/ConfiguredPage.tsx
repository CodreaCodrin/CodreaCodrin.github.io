import PageWrapper from '../components/layout/PageWrapper';
import CollectionView from '../components/collections/CollectionView';
import ReturnHome from '../components/navigation/ReturnHome';
import { useDiscovery } from '../context/DiscoveryContext';
import discovery from '../../data/discovery.json';
import type { CollectionData } from '../components/collections/types';

export interface PageDefinition {
  path: string;
  dataFile: string;
  type: 'content' | 'gallery' | 'tierlist';
  matte?: boolean;
  discoveryId?: string;
}
interface ContentData { title: string; paragraphs: string[] }
const sources = import.meta.glob('../../data/**/*.json', { eager: true, import: 'default' });
export function pageData(page: PageDefinition) {
  const data = sources['../../data/' + page.dataFile];
  if (!data) throw new Error('Page data file missing: ' + page.dataFile);
  return data as ContentData & CollectionData;
}
export default function ConfiguredPage({ page }: { page: PageDefinition }) {
  const { unlocked } = useDiscovery();
  if (page.discoveryId && !unlocked.includes(page.discoveryId)) return <div className="collection-page">
    <ReturnHome /><div className="locked-view"><h1>{discovery.lockedTitle}</h1><p>{discovery.lockedDescription}</p></div>
  </div>;
  const data = pageData(page);
  if (page.type !== 'content') return <CollectionView data={data} rated={page.type === 'tierlist'} />;
  return <PageWrapper className="max-w-5xl"><h1 className="page-title">{data.title}</h1>
    <div className="prose-sections">{data.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </PageWrapper>;
}
