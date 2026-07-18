import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/{year}/results/{state}/{lga} — the index shows the LGA's
// wards; the nested $ward route drills into a ward's polling-unit result sheets.
// Must render an <Outlet /> so the $ward child page can appear (without it, the
// child route would fall back to this layout and every ward URL would show the LGA).
export const Route = createFileRoute('/elections/$year/results/$state/$lga')({ component: () => <Outlet /> })
