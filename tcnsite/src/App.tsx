import { 
  Outlet, 
  createRootRoute, 
  createRoute, 
  createRouter, 
  RouterProvider
} from '@tanstack/react-router'

import Home from './pages/Home/Home.tsx'
import About from './pages/About/About.tsx'
import Projects from './pages/Projects/Projects.tsx'
import Hobbies from './pages/Hobbies/Hobbies.tsx'
import Contact from './pages/Contact/Contact.tsx'
import NotFound from './pages/NotFound/NotFound.tsx'
import NavBar from './components/navigation/NavBar.tsx'

function RootComponent() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: Projects,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aboutme',
  component: About
})

const hobbiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hobbies',
  component: Hobbies
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contactme',
  component: Contact
})

const routeTree = rootRoute.addChildren([indexRoute, projectsRoute, aboutRoute, hobbiesRoute, contactRoute])
const router = createRouter({ 
  routeTree,
  defaultNotFoundComponent: NotFound
 })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}