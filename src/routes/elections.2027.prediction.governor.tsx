import { createFileRoute } from '@tanstack/react-router'
import { Race2027 } from '../components/Race2027'

export const Route = createFileRoute('/elections/2027/prediction/governor')({ component: () => <Race2027 race="governor" /> })
