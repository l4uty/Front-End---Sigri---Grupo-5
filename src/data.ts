import type { Alert, AlertChange, AlertStatus, Measurement, Notice, Refuge, Sensor, Threshold, User, Zone } from './types'

export const usersSeed: User[] = [
  { id: 1, username: 'martin', name: 'Martín Gómez', email: 'mgomez@municipio.gob.ar', role: 'ADMINISTRADOR', active: true },
  { id: 2, username: 'lucia', name: 'Lucía Fernández', email: 'lfernandez@defensacivil.gob.ar', role: 'OPERADOR', active: true },
  { id: 3, username: 'sofia', name: 'Sofía Ibarra', email: 'sibarra@laplata.gob.ar', role: 'AUTORIDAD', active: true },
  { id: 4, username: 'diego', name: 'Diego Pérez', email: 'dperez@defensacivil.gob.ar', role: 'OPERADOR', active: false },
]

export const zonesSeed: Zone[] = [
  { id: 1, name: 'Ringuelet · Tolosa', description: 'Cuenca del arroyo del Gato.', lat: -34.884, lng: -57.996, diameter: 1600, risk: 4, sensorIds: [1, 2, 3] },
  { id: 2, name: 'San Carlos', description: 'Área urbana con anegamientos recurrentes.', lat: -34.944, lng: -58.013, diameter: 1500, risk: 4, sensorIds: [4, 5, 6] },
  { id: 3, name: 'Villa Elvira', description: 'Sector bajo próximo al arroyo Maldonado.', lat: -34.944, lng: -57.914, diameter: 1450, risk: 3, sensorIds: [7, 8, 9] },
  { id: 4, name: 'Altos de San Lorenzo', description: 'Escurrimiento insuficiente en tormentas intensas.', lat: -34.968, lng: -57.944, diameter: 1380, risk: 3, sensorIds: [10, 11] },
  { id: 5, name: 'Los Hornos', description: 'Zona de atención por acumulación pluvial.', lat: -34.971, lng: -57.985, diameter: 1300, risk: 2, sensorIds: [12, 13, 14] },
  { id: 6, name: 'Barrio Norte', description: 'Monitoreo preventivo del casco norte.', lat: -34.9, lng: -57.966, diameter: 1050, risk: 1, sensorIds: [15, 16] },
  { id: 7, name: 'Parque Saavedra', description: 'Zona verde con reservorio temporal.', lat: -34.931, lng: -57.944, diameter: 920, risk: 1, sensorIds: [17, 18] },
  { id: 8, name: 'El Mondongo', description: 'Área residencial próxima al casco.', lat: -34.922, lng: -57.939, diameter: 1200, risk: 3, sensorIds: [19, 20] },
  { id: 9, name: 'Melchor Romero', description: 'Monitoreo rural y periurbano.', lat: -34.948, lng: -58.055, diameter: 1100, risk: 2, sensorIds: [21, 22] },
  { id: 10, name: 'Gonnet', description: 'Seguimiento preventivo del arroyo Rodríguez.', lat: -34.89, lng: -58.025, diameter: 850, risk: 1, sensorIds: [23, 24] },
  { id: 11, name: 'City Bell', description: 'Puntos bajos del centro de City Bell.', lat: -34.865, lng: -58.05, diameter: 900, risk: 2, sensorIds: [25, 26] },
  { id: 12, name: 'Berisso Oeste', description: 'Área próxima a canales y bañados.', lat: -34.93, lng: -57.885, diameter: 980, risk: 1, sensorIds: [27, 28] },
]

const types = ['Pluviómetro', 'Nivel de agua', 'Humedad']

// Lectura normal según el tipo de sensor (por debajo de los umbrales)
export function normalValue(type: string, seed: number): number {
  if (type === 'Nivel de agua') return Number((0.3 + ((seed * 7) % 15) / 10).toFixed(1))
  if (type === 'Humedad') return 45 + ((seed * 7) % 36)
  return 8 + ((seed * 7) % 25)
}

export const sensorsSeed: Sensor[] = Array.from({ length: 42 }, (_, index) => {
  const id = index + 1
  const status = id === 39 ? 'Desconectado' : id === 40 ? 'Desconectado' : id === 41 ? 'En mantenimiento' : id === 42 ? 'Inactivo' : 'Activo'
  const explicitCodes: Record<number, string> = { 1: 'S-1047', 4: 'S-1042', 7: 'S-2210', 10: 'S-3105', 12: 'S-4012', 15: 'S-1044', 30: 'S-2230', 39: 'S-6007', 40: 'S-4016', 41: 'S-3110', 42: 'S-7002' }
  const type = types[index % types.length]
  // Un sensor asociado se ubica dentro del círculo de su zona (al 55 % del radio)
  const zone = zonesSeed.find(z => z.sensorIds.includes(id))
  const angle = index * 2.4
  const distance = zone ? (zone.diameter / 2) * 0.55 : 0
  const lat = zone ? zone.lat + (distance * Math.cos(angle)) / 111320 : -34.87 - (index % 7) * 0.015 - Math.floor(index / 14) * 0.004
  const lng = zone ? zone.lng + (distance * Math.sin(angle)) / (111320 * Math.cos((zone.lat * Math.PI) / 180)) : -58.045 + (index % 11) * 0.014
  return {
    id,
    code: explicitCodes[id] ?? `S-${String(1100 + id * 37)}`,
    type,
    status,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    lastValue: normalValue(type, index),
    unit: type === 'Pluviómetro' ? 'mm/h' : type === 'Nivel de agua' ? 'm' : '%',
    lastReport: status === 'Activo' ? `01:${String(42 - (index % 10)).padStart(2, '0')}` : status === 'Desconectado' ? '00:58' : 'Ayer',
  } as Sensor
})

export const thresholdsSeed: Threshold[] = zonesSeed.flatMap((zone, index) => [
  { id: index * 3 + 1, zoneId: zone.id, sensorType: 'Pluviómetro', max: 35 + (index % 3) * 5, unit: 'mm/h' },
  { id: index * 3 + 2, zoneId: zone.id, sensorType: 'Nivel de agua', min: 0.2, max: 1.8 + (index % 2) * 0.2, unit: 'm' },
  { id: index * 3 + 3, zoneId: zone.id, sensorType: 'Humedad', min: 20, max: 85, unit: '%' },
])

export const refugesSeed: Refuge[] = [
  { id: 1, name: 'Refugio San Martín', description: 'Centro comunitario accesible.', address: 'Av. 7 y 50', lat: -34.9212, lng: -57.9541 },
  { id: 2, name: 'Club Villa Elvira', description: 'Salón cubierto de uso informativo.', address: 'Calle 6 y 82', lat: -34.936, lng: -57.93 },
  { id: 3, name: 'Centro Los Hornos', description: 'Centro barrial próximo a Av. 66.', address: 'Calle 137 y 62', lat: -34.972, lng: -57.985 },
  { id: 4, name: 'Escuela N.º 15', description: 'Edificio escolar con acceso vehicular.', address: 'Camino Centenario', lat: -34.883, lng: -58.012 },
  { id: 5, name: 'Club San Carlos', description: 'Espacio comunitario.', address: 'Calle 32 y 137', lat: -34.946, lng: -58.015 },
  { id: 6, name: 'Delegación Tolosa', description: 'Dependencia municipal.', address: 'Calle 2 bis y 528', lat: -34.891, lng: -58.002 },
  { id: 7, name: 'Centro Gonnet', description: 'Punto informativo.', address: 'Camino Belgrano y 501', lat: -34.889, lng: -58.028 },
  { id: 8, name: 'Escuela N.º 42', description: 'Punto informativo.', address: 'Calle 22 y 72', lat: -34.932, lng: -57.946 },
  { id: 9, name: 'Club Berisso Oeste', description: 'Punto informativo.', address: 'Av. Montevideo y 40', lat: -34.924, lng: -57.89 },
]

// ---------- Ayudas para que mediciones y alertas sean coherentes ----------
const thresholdFor = (zoneId: number, sensorType: string) => thresholdsSeed.find(t => t.zoneId === zoneId && t.sensorType === sensorType)
const isExceeded = (zoneId: number, sensorType: string, value: number) => {
  const t = thresholdFor(zoneId, sensorType)
  return Boolean(t && ((t.max !== undefined && value > t.max) || (t.min !== undefined && value < t.min)))
}
const sensorById = (id: number) => sensorsSeed.find(s => s.id === id)!
const zoneOfSensor = (id: number) => zonesSeed.find(z => z.sensorIds.includes(id))!
const atTime = (date: string, minutes: number) => `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00`

// Cada alerta nace de una medición del mismo sensor y de la misma zona, que supera su umbral
const alertPlan = Array.from({ length: 42 }, (_, index) => {
  const zone = zonesSeed[index % zonesSeed.length]
  const sensor = sensorById(zone.sensorIds[index % zone.sensorIds.length])
  const date = `2026-10-${String(27 - Math.floor(index / 8)).padStart(2, '0')}`
  const minutes = 91 + (index % 12) // 01:31 a 01:42
  const t = thresholdFor(zone.id, sensor.type)!
  const value = index === 0 ? 52
    : sensor.type === 'Nivel de agua' ? Number(((t.max ?? 1.8) + 0.1 + (index % 5) * 0.1).toFixed(2))
    : (t.max ?? 35) + 2 + ((index * 3) % 14)
  return { index, zone, sensor, date, minutes, value, manual: index % 7 === 3 }
})

const alertMeasurements: Measurement[] = alertPlan.map(p => ({
  id: p.index + 1,
  sensorId: p.sensor.id,
  zoneId: p.zone.id,
  value: p.value,
  unit: p.sensor.unit,
  dateTime: atTime(p.date, p.minutes),
  origin: p.manual ? 'Manual' : 'Automática',
  exceeded: isExceeded(p.zone.id, p.sensor.type, p.value),
}))

// Mediciones normales: siempre antes de la 01:00, así la última lectura de un sensor en alerta es la que la disparó
const normalMeasurements: Measurement[] = Array.from({ length: 38 }, (_, index) => {
  const sensor = sensorById((index % 28) + 1)
  const zone = zoneOfSensor(sensor.id)
  const value = normalValue(sensor.type, index + 3)
  return {
    id: 43 + index,
    sensorId: sensor.id,
    zoneId: zone.id,
    value,
    unit: sensor.unit,
    dateTime: atTime(`2026-10-${String(27 - Math.floor(index / 6)).padStart(2, '0')}`, 10 + (index % 40)),
    origin: index % 7 === 0 ? 'Manual' : 'Automática',
    exceeded: isExceeded(zone.id, sensor.type, value),
  }
})

export const measurementsSeed: Measurement[] = [...alertMeasurements, ...normalMeasurements].sort((a, b) => b.dateTime.localeCompare(a.dateTime))

// La última lectura de cada sensor es su medición más reciente
for (const sensor of sensorsSeed) {
  const last = measurementsSeed.find(m => m.sensorId === sensor.id)
  if (last) sensor.lastValue = last.value
}

// Recorrido válido de estados (D13): Activa → En análisis → Atendida → Cerrada, o Activa → Descartada
const statusPath: Record<AlertStatus, AlertStatus[]> = {
  Activa: [],
  'En análisis': ['En análisis'],
  Atendida: ['En análisis', 'Atendida'],
  Cerrada: ['En análisis', 'Atendida', 'Cerrada'],
  Descartada: ['Descartada'],
}
const stepMinutes = [5, 25, 55]
const stepNote: Record<AlertStatus, string> = {
  Activa: '',
  'En análisis': 'Se verifica la zona.',
  Atendida: 'Se coordinó la intervención en el lugar.',
  Cerrada: 'Los valores volvieron a la normalidad.',
  Descartada: 'Evento no relevante.',
}

export const alertsSeed: Alert[] = alertPlan.map(p => {
  const active = p.index < 5
  const status: AlertStatus = active ? (p.index === 1 ? 'En análisis' : p.index === 3 ? 'Atendida' : 'Activa') : p.index % 3 === 0 ? 'Cerrada' : 'Descartada'
  let previous: AlertStatus = 'Activa'
  const changes: AlertChange[] = statusPath[status].map((to, step) => {
    const change: AlertChange = { id: p.index * 10 + 2 + step, dateTime: atTime(p.date, p.minutes + stepMinutes[step]), from: previous, to, user: 'Lucía Fernández', observation: stepNote[to] }
    previous = to
    return change
  })
  return {
    id: p.index + 1,
    sensorId: p.sensor.id,
    zoneId: p.zone.id,
    measurementId: p.index + 1,
    level: p.zone.risk,
    status,
    dateTime: atTime(p.date, p.minutes),
    description: `La medición superó el umbral configurado para ${p.zone.name}.`,
    history: [
      { id: p.index * 10 + 1, dateTime: atTime(p.date, p.minutes), to: 'Activa', user: 'Sistema', observation: p.manual ? 'Generada por una medición manual.' : 'Generada automáticamente por la medición.' },
      ...changes,
    ],
  }
})

export const noticesSeed: Notice[] = [
  { id: 1, type: 'alert', title: 'Nueva alerta crítica', message: 'S-1047 · Ringuelet · Tolosa · 52 mm/h', time: '01:31', read: false, persistent: true, alertId: 1, actionLabel: 'Ver alerta' },
  { id: 2, type: 'warning', title: 'Sensor desconectado', message: 'S-4016 no informa desde las 00:58.', time: '01:12', read: false, actionLabel: 'Ver sensor' },
  { id: 3, type: 'info', title: 'Simulación automática', message: 'La última ejecución generó 38 mediciones.', time: '01:42', read: false },
  { id: 4, type: 'success', title: 'Zona actualizada', message: 'Barrio Norte guardó sus cambios.', time: '00:55', read: true },
  { id: 5, type: 'error', title: 'Sin conexión', message: 'No se pudo sincronizar. Revisá tu conexión.', time: '00:42', read: false, persistent: true, actionLabel: 'Reintentar' },
]