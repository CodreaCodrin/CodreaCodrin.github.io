import CollectionView from '../../components/collections/CollectionView';
import data from '../../../data/manhwaTierlist.json';
export default function ManhwaTierlist() { return <CollectionView data={data} rated />; }
