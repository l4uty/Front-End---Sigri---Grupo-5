import { AppLayout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { AlertsPage } from './pages/AlertsPage'
import { MeasurementsPage } from './pages/MeasurementsPage'
import { SummaryPage } from './pages/SummaryPage'
import { RefugesPage, SensorsPage, ThresholdsPage, UsersPage, ZonesPage } from './pages/AdminPages'
import { useDemoStore } from './store/DemoStore'

export default function App() {
  const { currentUser, page } = useDemoStore()
  if (!currentUser) return <LoginPage />
  const pages = {
    mapa: <MapPage />,
    alertas: <AlertsPage />,
    mediciones: <MeasurementsPage />,
    resumen: <SummaryPage />,
    zonas: <ZonesPage />,
    sensores: <SensorsPage />,
    umbrales: <ThresholdsPage />,
    refugios: <RefugesPage />,
    usuarios: <UsersPage />,
  }
  return <AppLayout>{pages[page]}</AppLayout>
}
