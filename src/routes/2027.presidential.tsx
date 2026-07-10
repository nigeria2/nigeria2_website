import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /2027/presidential and its children (/states). The map lives in the
// index route; this only renders the matched child.
export const Route = createFileRoute('/2027/presidential')({
  component: () => <Outlet />,
})
