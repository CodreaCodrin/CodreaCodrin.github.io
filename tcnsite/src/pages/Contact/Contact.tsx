import PageWrapper from '../../components/layout/PageWrapper';
import SocialLinks from '../../components/navigation/SocialLinks';
import copy from '../../../data/site.json';
export default function Contact() {
  return <PageWrapper className="max-w-xl"><h1 className="page-title">{copy.contact.title}</h1><hr className="home-divider" /><SocialLinks /></PageWrapper>;
}
