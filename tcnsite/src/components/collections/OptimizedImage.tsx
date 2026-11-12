import { useState } from 'react';
import { ImageOff, Image as ImageIcon } from 'lucide-react';
import type { CollectionItem } from './types';
import { assetUrl } from '../../lib/format';
import copy from '../../../data/collections.json';
export default function OptimizedImage({ item, directory, priority = false, aspectRatio }: {
  item: CollectionItem; directory: string; priority?: boolean; aspectRatio?: { width: number; height: number };
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = (filename: string) => assetUrl(`${directory}/${filename}`);
  const srcSet = (value: string) => value.split(',').map(candidate => {
    const [filename, descriptor] = candidate.trim().split(/\s+/);
    return `${url(filename)} ${descriptor ?? ''}`;
  }).join(', ');
  const frame = aspectRatio ?? item;
  return <div className={`collection-image ${loaded ? 'is-loaded' : ''} ${aspectRatio ? 'normalized-cover' : ''}`} style={{ aspectRatio: `${frame.width} / ${frame.height}` }}>
    {!item.image || failed ? <div className="image-placeholder" role="img" aria-label={item.alt}>
      {failed ? <ImageOff size={28} /> : <ImageIcon size={28} />}
      <span>{failed ? copy.imageUnavailable : copy.imagePlaceholder}</span>
    </div> : <picture>
      {item.sources?.map(source => <source key={source.type} type={source.type} srcSet={srcSet(source.srcSet)} sizes={copy.imageSizes} />)}
      <img src={url(item.image)} srcSet={item.srcSet ? srcSet(item.srcSet) : undefined} sizes={copy.imageSizes}
        alt={item.alt} width={item.width} height={item.height} loading={priority ? 'eager' : 'lazy'}
        decoding="async" fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
    </picture>}
  </div>;
}
