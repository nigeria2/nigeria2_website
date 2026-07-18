import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout for /elections/{year}/results/{state} — the index shows the state's results
// tables; nested $lga and $lga/$ward routes drill into wards and polling-unit sheets.
export const Route = createFileRoute('/elections/$year/results/$state')({ component: () => <Outlet /> })
