import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /2027/presidential/states (index = state list) and its $state children.
export const Route = createFileRoute('/2027/presidential/states')({
  component: () => <Outlet />,
})
