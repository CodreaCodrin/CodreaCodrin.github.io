import { Star } from 'lucide-react';
import { format } from '../../lib/format';
import copy from '../../../data/collections.json';
export default function StarRating({ value }: { value: number }) {
  const rating = Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value * 2) / 2)) : 0;
  return <div className="rating" role="img" aria-label={format(copy.ratingLabel, { rating })}>
    <span className="stars" aria-hidden="true">{Array.from({ length: 5 }, (_, index) =>
      <span className="star" key={index}><Star size={17} /><span style={{ width: `${Math.min(1, Math.max(0, rating - index)) * 100}%` }}><Star size={17} fill="currentColor" /></span></span>)}</span>
    <span aria-hidden="true">{rating.toFixed(1)} <span className="muted">{copy.ratingSuffix}</span></span>
  </div>;
}
