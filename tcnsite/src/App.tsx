import { lazy, Suspense, useEffect, useRef } from 'react';
import { Outlet, createRootRoute, createRoute, createRouter, RouterProvider, createHashHistory, useLocation, redirect } from '@tanstack/react-router';
import Home from './pages/Home/Home';
import { useNavigationShortcuts } from './hooks/useNavigationShortcuts';
import About from './pages/About/About';
import Projects from './pages/Projects/Projects';
import Hobbies from './pages/Hobbies/Hobbies';
import Contact from './pages/Contact/Contact';
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
import NavBar from './components/navigation/NavBar';
import Background from './components/layout/Background';
import Terminal from './components/command/Terminal';
import DiscoveryProvider from './context/DiscoveryProvider';
import { useDiscovery } from './context/DiscoveryContext';
import copy from '../data/site.json';
import discovery from '../data/discovery.json';
const ArtGallery = lazy(() => import('./pages/ArtGallery/ArtGallery'));
const ManhwaTierlist = lazy(() => import('./pages/ManhwaTierlist/ManhwaTierlist'));
import pages from '../data/pages.json';
import type { PageDefinition } from './pages/ConfiguredPage';
const ConfiguredPage = lazy(() => import('./pages/ConfiguredPage'));
const configuredPages = pages as PageDefinition[];

function RootComponent() {
  useNavigationShortcuts();
  const path = useLocation({ select: location => location.pathname });
  const { notification } = useDiscovery();
  const matte = configuredPages.find(item => item.path === path)?.matte ?? discovery.items.some(item => item.path === path);
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(path);
  useEffect(() => {
    const configured = configuredPages.find(item => item.path === path);
    const title = discovery.items.find(item => item.path === path)?.text ?? copy.navigation.find(item => item.path === path)?.text;
    document.title = title && path !== '/' ? `${title} · ${copy.brand}` : copy.documentTitle;
    let active = true;
    if (configured) void import('./pages/ConfiguredPage').then(({ pageData }) => {
      if (active) document.title = `${pageData(configured).title} · ${copy.brand}`;
    });
    if (previousPath.current !== path) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.current?.focus({ preventScroll: true });
      previousPath.current = path;
    }
    return () => { active = false; };
  }, [path]);
  return <>
    <Background matte={matte} />
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus(); }}>{copy.skipContent}</a>
    <NavBar />
    <main ref={main} id="main-content" tabIndex={-1}>
      <div key={path} className={`route-view ${matte ? 'matte-view' : ''}`}><Suspense fallback={<div className="route-loading" role="status">{copy.loading}</div>}><Outlet /></Suspense></div>
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
const manhwaRoute = createRoute({ getParentRoute: () => rootRoute, path: '/manwa-manga-tierlist', component: ManhwaTierlist });
const legacyManhwaRoute = createRoute({ getParentRoute: () => rootRoute, path: '/manhwa-tierlist', beforeLoad: () => { throw redirect({ to: '/manwa-manga-tierlist', replace: true }); } });
const extraRoutes = configuredPages.map(page => createRoute({ getParentRoute: () => rootRoute, path: page.path, component: () => <ConfiguredPage page={page} /> }));
const routeTree = rootRoute.addChildren([...extraRoutes,indexRoute, aboutRoute, projectsRoute, hobbiesRoute, contactRoute, artRoute, manhwaRoute, legacyManhwaRoute]);
const router = createRouter({ routeTree, history: createHashHistory(), defaultNotFoundComponent: NotFound });
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
export default function App() {
  return <DiscoveryProvider><RouterProvider router={router} /></DiscoveryProvider>;
}
