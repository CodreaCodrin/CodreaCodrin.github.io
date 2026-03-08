import React from 'react'
import { 
  Outlet, 
  Link, 
  createRootRoute, 
  createRoute, 
  createRouter, 
  RouterProvider 
} from '@tanstack/react-router'

import Home from './pages/Home.tsx'

// 1. Definim Root Route (Structura de bază a site-ului)
const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/projects">Projects</Link>
      </nav>
      
      {/* Aici vor fi injectate componentele Home sau Projects */}
      <main>
        <Outlet />
      </main>
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: () => (
    <div>
      <h1>Projects</h1>
      <p>Lista de proiecte va fi aici.</p>
    </div>
  ),
})

const routeTree = rootRoute.addChildren([indexRoute, projectsRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}