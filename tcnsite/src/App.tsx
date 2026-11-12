import { useEffect, useRef } from 'react';
import { Outlet, createRootRoute, createRoute, createRouter, RouterProvider, createHashHistory, useLocation } from '@tanstack/react-router';
import { MotionConfig } from 'framer-motion';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Projects from './pages/Projects/Projects';
import Hobbies from './pages/Hobbies/Hobbies';
import Contact from './pages/Contact/Contact';
import NotFound from './pages/NotFound/NotFound';
import NavBar from './components/navigation/NavBar';
import Background from './components/layout/Background';
import Terminal from './components/command/Terminal';
import DiscoveryProvider from './context/DiscoveryProvider';
import { useDiscovery } from './context/DiscoveryContext';
import copy from '../data/site.json';
import discovery from '../data/discovery.json';
import ArtGallery from './pages/ArtGallery/ArtGallery';
import ManhwaTierlist from './pages/ManhwaTierlist/ManhwaTierlist';

function RootComponent() {
  const path = useLocation({ select: location => location.pathname });
  const { notification } = useDiscovery();
  const matte = discovery.items.some(item => item.path === path);
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(path);
  useEffect(() => {
    const title = discovery.items.find(item => item.path === path)?.text ?? copy.navigation.find(item => item.path === path)?.text;
    document.title = title && path !== '/' ? `${title} · ${copy.brand}` : copy.documentTitle;
    if (previousPath.current !== path) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.current?.focus({ preventScroll: true });
      previousPath.current = path;
    }
  }, [path]);
  return <>
    <Background matte={matte} />
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus(); }}>{copy.skipContent}</a>
    <NavBar />
    <main ref={main} id="main-content" tabIndex={-1}>
      <div key={path} className={`route-view ${matte ? 'matte-view' : ''}`}><Outlet /></div>
    </main>
    <div className="discovery-toast" role="status" aria-live="polite">{notification && <div><span className="eyebrow">{discovery.eyebrow}</span><p>{notification}</p></div>}</div>
    <Terminal />
  </>;
}
function RouteError() {
  return <div className="collection-page"><h1 className="page-title">{copy.routeError.title}</h1><p>{copy.routeError.description}</p><button className="return-home" onClick={() => window.location.reload()}>{copy.routeError.retry}</button></div>;
}
const rootRoute = createRootRoute({ component: RootComponent, errorComponent: RouteError });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/aboutme', component: About });
const projectsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projects', component: Projects });
const hobbiesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/hobbies', component: Hobbies });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contactme', component: Contact });
const artRoute = createRoute({ getParentRoute: () => rootRoute, path: '/art-gallery', component: ArtGallery });
const manhwaRoute = createRoute({ getParentRoute: () => rootRoute, path: '/manhwa-tierlist', component: ManhwaTierlist });
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, projectsRoute, hobbiesRoute, contactRoute, artRoute, manhwaRoute]);
const router = createRouter({ routeTree, history: createHashHistory(), defaultNotFoundComponent: NotFound });
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
export default function App() {
  return <MotionConfig reducedMotion="user"><DiscoveryProvider><RouterProvider router={router} /></DiscoveryProvider></MotionConfig>;
}
