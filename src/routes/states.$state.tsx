import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /states/$state and its children (/lgas, /politicians). It only renders
// the matched child via <Outlet/>; the state overview lives in states.$state.index.tsx.
export const Route = createFileRoute('/states/$state')({
  component: () => <Outlet />,
})
