import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import data from '../../../data/site.json';
export default function ReturnHome() {
  return <Link to="/" className="return-home"><ArrowLeft size={17} aria-hidden="true" />{data.returnHome}</Link>;
}
