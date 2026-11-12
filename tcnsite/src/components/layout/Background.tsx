import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import data from '../../../data/themes.json';
import { assetUrl } from '../../lib/format';
export default function Background({ matte }: { matte: boolean }) {
  const { themeName } = useTheme();
  const source = data.themes[themeName].background;
  const [loaded, setLoaded] = useState<string[]>([]);
  useEffect(() => {
    if (!source || matte) return;
    let active = true;
    const image = new Image();
    image.src = assetUrl(source);
    void image.decode().then(() => {
      if (active) setLoaded(previous => previous.includes(source) ? previous : [...previous, source]);
    }).catch(() => { /* Matte color is the fallback for missing images. */ });
    return () => { active = false; };
  }, [source, matte]);
  return <div className="site-background" aria-hidden="true">
    {loaded.map(path => <div key={path} className="background-layer" style={{ backgroundImage: `url("${assetUrl(path)}")`, opacity: !matte && path === source ? 1 : 0 }} />)}
  </div>;
}
