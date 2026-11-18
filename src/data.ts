import type { Alert, Measurement, Notice, Refuge, Sensor, Threshold, User, Zone } from './types'

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
export const sensorsSeed: Sensor[] = Array.from({ length: 42 }, (_, index) => {
  const id = index + 1
  const status = id === 39 ? 'Desconectado' : id === 40 ? 'Desconectado' : id === 41 ? 'En mantenimiento' : id === 42 ? 'Inactivo' : 'Activo'
  const explicitCodes: Record<number, string> = { 1: 'S-1047', 4: 'S-1042', 7: 'S-2210', 10: 'S-3105', 12: 'S-4012', 15: 'S-1044', 39: 'S-6007', 40: 'S-4016', 41: 'S-3110', 42: 'S-7002' }
  return {
    id,
    code: explicitCodes[id] ?? `S-${String(1100 + id * 37)}`,
    type: types[index % types.length],
    status,
    lat: -34.87 - (index % 7) * 0.015 - Math.floor(index / 14) * 0.004,
    lng: -58.045 + (index % 11) * 0.014,
    lastValue: 18 + (index * 7) % 34,
    unit: index % 3 === 0 ? 'mm/h' : index % 3 === 1 ? 'm' : '%',
    lastReport: status === 'Activo' ? `01:${String(42 - (index % 10)).padStart(2, '0')}` : status === 'Desconectado' ? '00:58' : 'Ayer',
  } as Sensor
})

export const thresholdsSeed: Threshold[] = zonesSeed.flatMap((zone, index) => [
  { id: index * 2 + 1, zoneId: zone.id, sensorType: 'Pluviómetro', max: 35 + (index % 3) * 5, unit: 'mm/h' },
  { id: index * 2 + 2, zoneId: zone.id, sensorType: 'Nivel de agua', min: 0.2, max: 1.8 + (index % 2) * 0.2, unit: 'm' },
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

export const measurementsSeed: Measurement[] = Array.from({ length: 80 }, (_, index) => {
  const sensorId = (index % 38) + 1
  const zone = zonesSeed.find(z => z.sensorIds.includes(sensorId)) ?? zonesSeed[index % zonesSeed.length]
  const value = 18 + (index * 7) % 35
  return { id: index + 1, sensorId, zoneId: zone.id, value, unit: 'mm/h', dateTime: `2026-10-${String(27 - Math.floor(index / 12)).padStart(2, '0')}T01:${String(42 - (index % 40)).padStart(2, '0')}:00`, origin: index % 7 === 0 ? 'Manual' : 'Automática', exceeded: value > 35 }
})

export const alertsSeed: Alert[] = Array.from({ length: 42 }, (_, index) => {
  const active = index < 5
  const zone = zonesSeed[index % zonesSeed.length]
  const sensorId = zone.sensorIds[index % zone.sensorIds.length]
  const status: Alert['status'] = active ? (index === 1 ? 'En análisis' : index === 3 ? 'Atendida' : 'Activa') : index % 3 === 0 ? 'Cerrada' : 'Descartada'
  const level = ([4, 4, 3, 3, 2, 1] as const)[index % 6]
  return {
    id: index + 1,
    sensorId,
    zoneId: zone.id,
    measurementId: index + 1,
    level,
    status,
    dateTime: `2026-10-${String(27 - Math.floor(index / 8)).padStart(2, '0')}T01:${String(31 + (index % 12)).padStart(2, '0')}:00`,
    description: `La medición superó el umbral configurado para ${zone.name}.`,
    history: [
      { id: index * 10 + 1, dateTime: '2026-10-27T01:31:00', to: 'Activa', user: 'Sistema', observation: 'Generada automáticamente por la medición.' },
      ...(status !== 'Activa' ? [{ id: index * 10 + 2, dateTime: '2026-10-27T01:36:00', from: 'Activa' as const, to: status, user: 'Lucía Fernández', observation: status === 'Descartada' ? 'Evento no relevante.' : 'Se verificó la zona.' }] : []),
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
