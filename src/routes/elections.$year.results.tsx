import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/{year}/results (index = state list) and its $state children.
export const Route = createFileRoute('/elections/$year/results')({ component: () => <Outlet /> })
