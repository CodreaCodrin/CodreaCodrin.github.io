import { useEffect, useId, useState, type CSSProperties } from 'react';
import data from '../../../data/background.json';
import { useBackground } from '../../context/BackgroundContext';
import './Background.css';

export default function Background({ matte }: { matte: boolean }) {
  const { background } = useBackground();
  const gradientId = useId();
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const style = {
    '--field-duration': `${data.motion.fieldSeconds}s`,
    '--orbit-duration': `${data.motion.orbitSeconds}s`,
    '--points-duration': `${data.motion.pointsSeconds}s`,
  } as CSSProperties;
  return <div className="site-background" aria-hidden="true" data-matte={matte} data-paused={hidden || matte} style={style}>
    {background !== 'none' && <div className="background-art" key={background}>
      <div className="background-light background-light-primary" />
      <div className="background-light background-light-secondary" />
      <div className="background-dots" />
      <svg className={`background-orbits ${background === 'flow' ? 'background-flow' : ''}`} viewBox={data.viewBox} preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="35%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="70%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="background-orbit-drift" fill="none" stroke={`url(#${gradientId})`}>
          {background === 'flow' ? data.flow.map(line => <path key={line.id} d={line.path} opacity={line.opacity} vectorEffect="non-scaling-stroke" />) : data.orbits.map(orbit => <ellipse key={orbit.id} cx={orbit.x} cy={orbit.y} rx={orbit.radiusX} ry={orbit.radiusY}
            transform={`rotate(${orbit.rotation} ${orbit.x} ${orbit.y})`} opacity={orbit.opacity} vectorEffect="non-scaling-stroke" />)}
        </g>
        {background === 'orbits' && <g className="background-orbit-points" fill="currentColor">
          {data.points.map(point => <circle key={point.id} cx={point.x} cy={point.y} r={point.radius} opacity={point.opacity} />)}
        </g>}
      </svg>
      <div className="background-vignette" />
    </div>}
  </div>;
}
