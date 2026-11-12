import './CollectionView.css';
import { useState } from 'react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { useDiscovery } from '../../context/DiscoveryContext';
import ReturnHome from '../navigation/ReturnHome';
import Modal from '../common/Modal';
import OptimizedImage from './OptimizedImage';
import StarRating from './StarRating';
import type { CollectionData, CollectionItem } from './types';
import { sortByTitle, sortByRating } from './sortByTitle';
import copy from '../../../data/collections.json';
import discovery from '../../../data/discovery.json';
export default function CollectionView({ data, rated = false }: { data: CollectionData; rated?: boolean }) {
  const { unlocked } = useDiscovery();
  const [selected, setSelected] = useState<CollectionItem | null>(null);
  const items = data.sort === 'rating' ? sortByRating(data.items)
    : data.sort === 'title' ? sortByTitle(data.items) : data.items;
  if (data.discoveryId && !unlocked.includes(data.discoveryId)) return <div className="collection-page"><ReturnHome /><div className="locked-view">
    <LockKeyhole size={32} /><h1>{discovery.lockedTitle}</h1><p>{discovery.lockedDescription}</p>
  </div></div>;
  return <div className="collection-page">
    <ReturnHome />
    <header className="collection-header"><p className="eyebrow">{data.eyebrow}</p><h1>{data.title}</h1><p>{data.description}</p></header>
    {data.sampleNotice && data.items.some(item => item.sample) && <p className="sample-notice">{data.sampleNotice}</p>}
    <div className={`collection-grid ${rated ? 'rated-grid' : ''}`}>
      {items.map((item, index) => {
        const content = <>
          {rated && <h2>{item.title}</h2>}
          <OptimizedImage key={`${data.assetDirectory}/${item.image}`} item={item} directory={data.assetDirectory} priority={index === 0} aspectRatio={data.coverAspectRatio} />
          <div className="card-caption">
            {!rated && <h2>{item.title}</h2>}
            {rated && <StarRating value={item.rating ?? 0} />}
            <div className="card-meta">{item.sample && <span>{copy.sample}</span>}{item.description?.trim() && <span className="card-story">{copy.viewDescription}<ArrowUpRight size={14} /></span>}</div>
          </div>
        </>;
        return item.description?.trim()
          ? <button key={item.id} className="collection-card clickable-card" onClick={() => setSelected(item)} aria-haspopup="dialog">{content}</button>
          : <article key={item.id} className="collection-card">{content}</article>;
      })}
    </div>
    {!data.items.length && <p className="empty-collection">{data.emptyMessage}</p>}
    {selected && <Modal title={selected.title} onClose={() => setSelected(null)} className="description-modal">
      <p className="eyebrow">{data.eyebrow}</p><h2>{selected.title}</h2>
      {rated && <StarRating value={selected.rating ?? 0} />}
      <p className="description-copy">{selected.description}</p>
    </Modal>}
  </div>;
}
