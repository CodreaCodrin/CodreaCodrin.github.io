import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import data from '../../../data/themes.json';
import { assetUrl } from '../../lib/format';

export default function Background({ matte }: { matte: boolean }) {
  const { themeName } = useTheme();
  const source = data.themes[themeName].background;
  const [loaded, setLoaded] = useState<string[]>([]);
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (matte) return;
    if (!source) { setDisplayed(''); return; }
    let active = true;
    const image = new Image();
    const variants = data.backgroundVariants[source as keyof typeof data.backgroundVariants];
    image.decoding = 'async';
    image.fetchPriority = 'high';
    if (variants) {
      image.sizes = '100vw';
      image.srcset = variants.map(item => assetUrl(item.path) + ' ' + item.width + 'w').join(', ');
    }
    image.src = assetUrl(source);
    void image.decode().then(() => {
      if (!active) return;
      const selected = image.currentSrc || image.src;
      setLoaded(previous => previous.includes(selected) ? previous : [...previous, selected]);
      setDisplayed(selected);
    }).catch(() => { /* Keep the previous decoded image when a download fails. */ });
    return () => { active = false; };
  }, [source, matte]);
  return <div className="site-background" aria-hidden="true">
    {loaded.map(path => <div key={path} className="background-layer" style={{ backgroundImage: `url("${path}")`, opacity: !matte && path === displayed ? 1 : 0 }} />)}
  </div>;
}
