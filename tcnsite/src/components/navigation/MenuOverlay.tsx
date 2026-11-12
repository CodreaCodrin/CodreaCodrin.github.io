import { useDiscovery } from '../../context/DiscoveryContext';
import { useDiscoveryEffect } from '../../hooks/useDiscoveryEffect';
import Modal from '../common/Modal';
import OnPageNavButton from './onPageNavButton';
import copy from '../../../data/site.json';
import discovery from '../../../data/discovery.json';
export default function MenuOverlay({ onClose }: { onClose: () => void }) {
  const { unlocked } = useDiscovery();
  const ref = useDiscoveryEffect<HTMLDivElement>();
  return <Modal title={copy.openMenu} onClose={onClose} className="menu-modal">
    <div ref={ref}>
      <p className="eyebrow">{copy.menuEyebrow}</p><h2>{copy.menuTitle}</h2>
      <div className="menu-grid" onClick={event => { if ((event.target as HTMLElement).closest('a')) onClose(); }}>
        {copy.navigation.map(item => <OnPageNavButton key={item.path} {...item} />)}
        {discovery.items.filter(item => unlocked.includes(item.id)).map(item =>
          <OnPageNavButton key={item.id} {...item} discovered />)}
      </div>
    </div>
  </Modal>;
}
