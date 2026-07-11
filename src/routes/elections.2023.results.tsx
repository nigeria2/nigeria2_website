import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/2023/results (index = state list) and its $state children.
export const Route = createFileRoute('/elections/2023/results')({ component: () => <Outlet /> })
