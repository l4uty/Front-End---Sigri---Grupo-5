export type Role = 'ADMINISTRADOR' | 'OPERADOR' | 'AUTORIDAD'
export type PageKey = 'mapa' | 'alertas' | 'mediciones' | 'resumen' | 'zonas' | 'sensores' | 'umbrales' | 'refugios' | 'usuarios'
export type RiskLevel = 1 | 2 | 3 | 4
export type SensorStatus = 'Activo' | 'Inactivo' | 'En mantenimiento' | 'Desconectado' | 'Baja'
export type AlertStatus = 'Activa' | 'En análisis' | 'Atendida' | 'Cerrada' | 'Descartada'
export type MeasurementOrigin = 'Manual' | 'Automática'
export type NoticeType = 'success' | 'info' | 'warning' | 'error' | 'alert'

export interface User {
  id: number
  username: string
  name: string
  email: string
  role: Role
  active: boolean
}

export interface Zone {
  id: number
  name: string
  description: string
  lat: number
  lng: number
  diameter: number
  risk: RiskLevel
  sensorIds: number[]
}

export interface Sensor {
  id: number
  code: string
  type: string
  status: SensorStatus
  lat: number
  lng: number
  lastValue: number
  unit: string
  lastReport: string
}

export interface Threshold {
  id: number
  zoneId: number
  sensorType: string
  min?: number
  max?: number
  unit: string
}

export interface Refuge {
  id: number
  name: string
  description: string
  address: string
  lat: number
  lng: number
}

export interface Measurement {
  id: number
  sensorId: number
  zoneId: number
  value: number
  unit: string
  dateTime: string
  origin: MeasurementOrigin
  exceeded: boolean
}

export interface AlertChange {
  id: number
  dateTime: string
  from?: AlertStatus
  to: AlertStatus
  user: string
  observation: string
}

export interface Alert {
  id: number
  sensorId: number
  zoneId: number
  measurementId: number
  level: RiskLevel
  status: AlertStatus
  dateTime: string
  description: string
  history: AlertChange[]
}

export interface Notice {
  id: number
  type: NoticeType
  title: string
  message: string
  time: string
  read: boolean
  persistent?: boolean
  alertId?: number
  actionLabel?: string
}
