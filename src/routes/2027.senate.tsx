import { createFileRoute } from '@tanstack/react-router'
import { Race2027 } from '../components/Race2027'

export const Route = createFileRoute('/2027/senate')({ component: () => <Race2027 race="senate" /> })
