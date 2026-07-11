import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/2027/prediction/presidential/states (index = state list) and its $state children.
export const Route = createFileRoute('/elections/2027/prediction/presidential/states')({
  component: () => <Outlet />,
})
