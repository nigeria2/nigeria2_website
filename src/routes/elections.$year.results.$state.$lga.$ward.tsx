import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/{year}/results/{state}/{lga}/{ward} — the index lists the
// ward's polling units (with per-party votes); the nested $pu route drills into a
// single polling unit. Renders an <Outlet /> so the $pu child page can appear.
export const Route = createFileRoute('/elections/$year/results/$state/$lga/$ward')({ component: () => <Outlet /> })
