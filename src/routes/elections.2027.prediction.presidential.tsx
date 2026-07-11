import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/2027/prediction/presidential and its children (/states). The map lives in the
// index route; this only renders the matched child.
export const Route = createFileRoute('/elections/2027/prediction/presidential')({
  component: () => <Outlet />,
})
