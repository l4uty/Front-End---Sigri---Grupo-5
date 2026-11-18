import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { alertsSeed, measurementsSeed, noticesSeed, refugesSeed, sensorsSeed, thresholdsSeed, usersSeed, zonesSeed } from '../data'
import type { Alert, AlertStatus, Measurement, Notice, PageKey, Refuge, Sensor, Threshold, User, Zone } from '../types'

interface DemoStoreValue {
  currentUser: User | null
  page: PageKey
  zones: Zone[]
  sensors: Sensor[]
  thresholds: Threshold[]
  refuges: Refuge[]
  measurements: Measurement[]
  alerts: Alert[]
  users: User[]
  notices: Notice[]
  simulationRunning: boolean
  login: (username: string) => boolean
  loginAs: (user: User) => void
  logout: () => void
  setPage: (page: PageKey) => void
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>
  setSensors: React.Dispatch<React.SetStateAction<Sensor[]>>
  setThresholds: React.Dispatch<React.SetStateAction<Threshold[]>>
  setRefuges: React.Dispatch<React.SetStateAction<Refuge[]>>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  changeAlertStatus: (id: number, status: AlertStatus, observation: string) => void
  addMeasurement: (sensorId: number, value: number) => { alertId?: number }
  setSimulationRunning: (value: boolean) => void
  addNotice: (notice: Omit<Notice, 'id' | 'time' | 'read'>) => void
  markNoticeRead: (id: number) => void
  markAllNoticesRead: () => void
  removeNotice: (id: number) => void
  resetDemo: () => void
}

const DemoStore = createContext<DemoStoreValue | null>(null)

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [page, setPage] = useState<PageKey>('mapa')
  const [zones, setZones] = useState(zonesSeed)
  const [sensors, setSensors] = useState(sensorsSeed)
  const [thresholds, setThresholds] = useState(thresholdsSeed)
  const [refuges, setRefuges] = useState(refugesSeed)
  const [measurements, setMeasurements] = useState(measurementsSeed)
  const [alerts, setAlerts] = useState(alertsSeed)
  const [users, setUsers] = useState(usersSeed)
  const [notices, setNotices] = useState(noticesSeed)
  const [simulationRunning, setSimulationRunning] = useState(true)

  const login = (username: string) => {
    const user = users.find(item => item.username.toLowerCase() === username.trim().toLowerCase() && item.active)
    if (!user) return false
    setCurrentUser(user)
    setPage(user.role === 'AUTORIDAD' ? 'resumen' : user.role === 'OPERADOR' ? 'mapa' : 'mediciones')
    return true
  }

  const loginAs = (user: User) => {
    setCurrentUser(user)
    setPage(user.role === 'AUTORIDAD' ? 'resumen' : user.role === 'OPERADOR' ? 'mapa' : 'mediciones')
  }

  const logout = () => {
    setCurrentUser(null)
    setPage('mapa')
  }

  const addNotice = (notice: Omit<Notice, 'id' | 'time' | 'read'>) => {
    setNotices(items => [{ ...notice, id: Date.now(), time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), read: false }, ...items])
  }

  const changeAlertStatus = (id: number, status: AlertStatus, observation: string) => {
    setAlerts(items => items.map(alert => alert.id === id ? {
      ...alert,
      status,
      history: [...alert.history, { id: Date.now(), dateTime: new Date().toISOString(), from: alert.status, to: status, user: currentUser?.name ?? 'Usuario', observation }],
    } : alert))
    addNotice({ type: status === 'Descartada' ? 'warning' : 'success', title: `Alerta ${status.toLowerCase()}`, message: `El cambio quedó registrado con trazabilidad.`, actionLabel: status === 'Descartada' ? 'Deshacer' : undefined })
  }

  const addMeasurement = (sensorId: number, value: number) => {
    const sensor = sensors.find(item => item.id === sensorId)!
    const zone = zones.find(item => item.sensorIds.includes(sensorId)) ?? zones[0]
    const threshold = thresholds.find(item => item.zoneId === zone.id && item.sensorType === sensor.type)
    const exceeded = Boolean((threshold?.max !== undefined && value > threshold.max) || (threshold?.min !== undefined && value < threshold.min))
    const measurement: Measurement = { id: Date.now(), sensorId, zoneId: zone.id, value, unit: sensor.unit, dateTime: new Date().toISOString(), origin: 'Manual', exceeded }
    setMeasurements(items => [measurement, ...items])
    setSensors(items => items.map(item => item.id === sensorId ? { ...item, lastValue: value, lastReport: 'Ahora' } : item))
    let alertId: number | undefined
    if (exceeded) {
      alertId = Date.now() + 1
      const alert: Alert = { id: alertId, sensorId, zoneId: zone.id, measurementId: measurement.id, level: zone.risk, status: 'Activa', dateTime: new Date().toISOString(), description: `La medición manual superó el umbral de ${zone.name}.`, history: [{ id: Date.now() + 2, dateTime: new Date().toISOString(), to: 'Activa', user: currentUser?.name ?? 'Sistema', observation: 'Generada por una medición manual.' }] }
      setAlerts(items => [alert, ...items])
      addNotice({ type: 'alert', title: 'Nueva alerta generada', message: `${sensor.code} · ${zone.name} · ${value} ${sensor.unit}`, persistent: true, alertId, actionLabel: 'Ver alerta' })
    } else {
      addNotice({ type: 'success', title: 'Medición registrada', message: `${sensor.code} quedó dentro del umbral.` })
    }
    return { alertId }
  }

  const resetDemo = () => {
    setZones(zonesSeed); setSensors(sensorsSeed); setThresholds(thresholdsSeed); setRefuges(refugesSeed)
    setMeasurements(measurementsSeed); setAlerts(alertsSeed); setUsers(usersSeed); setNotices(noticesSeed); setSimulationRunning(true)
  }

  const value = useMemo<DemoStoreValue>(() => ({
    currentUser, page, zones, sensors, thresholds, refuges, measurements, alerts, users, notices, simulationRunning,
    login, loginAs, logout, setPage, setZones, setSensors, setThresholds, setRefuges, setUsers, changeAlertStatus, addMeasurement,
    setSimulationRunning, addNotice, markNoticeRead: id => setNotices(items => items.map(n => n.id === id ? { ...n, read: true } : n)),
    markAllNoticesRead: () => setNotices(items => items.map(n => ({ ...n, read: true }))), removeNotice: id => setNotices(items => items.filter(n => n.id !== id)), resetDemo,
  }), [currentUser, page, zones, sensors, thresholds, refuges, measurements, alerts, users, notices, simulationRunning])

  return <DemoStore.Provider value={value}>{children}</DemoStore.Provider>
}

export function useDemoStore() {
  const value = useContext(DemoStore)
  if (!value) throw new Error('useDemoStore debe utilizarse dentro de DemoStoreProvider')
  return value
}
