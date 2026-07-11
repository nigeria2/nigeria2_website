import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/elections/2027/prediction')({ component: () => <Outlet /> })
