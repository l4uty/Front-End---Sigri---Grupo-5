import { Circle, CircleMarker, LayersControl, MapContainer, Marker, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { BellRing, Building2, Crosshair, RadioTower } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDemoStore } from '../store/DemoStore'
import { RiskBadge, StatusChip } from '../components/UI'
import type { RiskLevel } from '../types'

const riskColors: Record<RiskLevel, string> = { 1: '#2f8a4c', 2: '#d9a400', 3: '#cf5a10', 4: '#a11a1a' }

function CoordinateReader({ onChange }: { onChange: (coords: string) => void }) {
  useMapEvents({ mousemove(event) { onChange(`Lat ${event.latlng.lat.toFixed(5)} · Long ${event.latlng.lng.toFixed(5)}`) } })
  return null
}

export function MapPage() {
  const { zones, sensors, refuges, alerts, setPage } = useDemoStore()
  const [coords, setCoords] = useState('Lat -34,92050 · Long -57,95360')
  const activeAlerts = alerts.filter(alert => ['Activa', 'En análisis', 'Atendida'].includes(alert.status)).slice(0, 5)
  const visibleSensorIds = useMemo(() => new Set(zones.slice(0, 7).flatMap(zone => zone.sensorIds)), [zones])
  const visibleSensors = sensors.filter(sensor => visibleSensorIds.has(sensor.id)).slice(0, 23)
  return <div className="map-layout">
    <section className="map-panel" aria-label="Mapa georreferenciado">
      <MapContainer center={[-34.925, -57.965]} zoom={13} scrollWheelZoom className="leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LayersControl position="topright">
          <LayersControl.Overlay checked name={`Zonas de riesgo (${zones.slice(0, 7).length})`}>
            <>{zones.slice(0, 7).map(zone => <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.diameter / 2} pathOptions={{ color: riskColors[zone.risk], fillColor: riskColors[zone.risk], fillOpacity: .18, weight: 2 }}><Tooltip permanent direction="top"><span className="map-label"><RiskBadge level={zone.risk} /> {zone.name}</span></Tooltip><Popup><strong>{zone.name}</strong><p>{zone.description}</p><p>Diámetro: {zone.diameter} m · Radio: {zone.diameter / 2} m</p></Popup></Circle>)}</>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name={`Sensores (${visibleSensors.length})`}>
            <>{visibleSensors.map(sensor => <CircleMarker key={sensor.id} center={[sensor.lat, sensor.lng]} radius={sensor.status === 'Activo' ? 7 : 8} pathOptions={{ color: sensor.status === 'Activo' ? '#17324f' : '#64748b', fillColor: sensor.status === 'Activo' ? '#fff' : '#e5e7eb', fillOpacity: 1, dashArray: sensor.status === 'Activo' ? undefined : '4 3', weight: 2 }}><Popup><strong>{sensor.code}</strong><p>{sensor.type}</p><StatusChip tone={sensor.status === 'Activo' ? 'success' : 'warning'}>{sensor.status}</StatusChip><p>Última lectura: {sensor.lastValue} {sensor.unit} · {sensor.lastReport}</p></Popup></CircleMarker>)}</>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name={`Refugios (${refuges.slice(0, 4).length})`}>
            <>{refuges.slice(0, 4).map(refuge => <Marker key={refuge.id} position={[refuge.lat, refuge.lng]} icon={L.divIcon({ className: 'refuge-marker', html: '<span>⌂</span>', iconSize: [26, 26] })}><Popup><strong>{refuge.name}</strong><p>{refuge.address}</p><p>{refuge.description}</p></Popup></Marker>)}</>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name={`Alertas activas (${activeAlerts.length})`}>
            <>{activeAlerts.map(alert => { const sensor = sensors.find(s => s.id === alert.sensorId)!; return <CircleMarker key={alert.id} center={[sensor.lat, sensor.lng]} radius={14} pathOptions={{ color: '#fff', fillColor: riskColors[alert.level], fillOpacity: 1, weight: 3, className: 'alert-marker' }}><Popup><strong>Alerta {sensor.code}</strong><p>{alert.description}</p><button onClick={() => setPage('alertas')}>Ver detalle</button></Popup></CircleMarker> })}</>
          </LayersControl.Overlay>
        </LayersControl>
        <CoordinateReader onChange={setCoords} />
      </MapContainer>
      <div className="map-coordinates"><Crosshair /> {coords}<span>Zoom 13 · Escala 1 km</span></div>
    </section>
    <aside className="active-alerts-panel"><header><div><p className="eyebrow">MONITOREO EN VIVO</p><h2>Alertas activas</h2></div><StatusChip tone="danger">{activeAlerts.length}</StatusChip></header><div className="quick-filter"><button className="is-active">Todas</button><button>Críticas</button><button>Altas</button></div><div className="alert-card-list">{activeAlerts.map(alert => { const sensor = sensors.find(s => s.id === alert.sensorId)!; const zone = zones.find(z => z.id === alert.zoneId)!; return <button className={`map-alert-card map-alert-card--${alert.level}`} key={alert.id} onClick={() => setPage('alertas')}><div><RiskBadge level={alert.level} /><time>{new Date(alert.dateTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</time></div><strong>{zone.name}</strong><span><RadioTower /> {sensor.code} · {sensor.lastValue} {sensor.unit}</span><small>{alert.status}</small></button> })}</div><button className="text-button" onClick={() => setPage('alertas')}>Ver todas las alertas</button><div className="map-legend"><strong>Leyenda</strong><span><RadioTower /> Sensor</span><span><Building2 /> Refugio</span><span><BellRing /> Sensor en alerta</span></div></aside>
  </div>
}
