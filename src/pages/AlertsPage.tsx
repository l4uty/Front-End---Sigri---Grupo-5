import { Clock3, Filter, History, Search, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Field, Modal, RiskBadge, StatusChip, Tabs } from '../components/UI'
import { useDemoStore } from '../store/DemoStore'
import type { AlertStatus } from '../types'

const nextStates: Record<AlertStatus, AlertStatus[]> = {
  Activa: ['En análisis', 'Descartada'],
  'En análisis': ['Atendida', 'Descartada'],
  Atendida: ['Cerrada'],
  Cerrada: [],
  Descartada: [],
}

export function AlertsPage() {
  const { alerts, zones, sensors, changeAlertStatus, currentUser } = useDemoStore()
  const [tab, setTab] = useState('activas')
  const [selectedId, setSelectedId] = useState(alerts[0]?.id)
  const [zoneFilter, setZoneFilter] = useState('')
  const [sensorFilter, setSensorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<'state' | 'discard' | null>(null)
  const [nextStatus, setNextStatus] = useState<AlertStatus>('En análisis')
  const [observation, setObservation] = useState('')
  const isReadOnly = currentUser?.role === 'AUTORIDAD' || currentUser?.role === 'ADMINISTRADOR'
  const activeStatuses: AlertStatus[] = ['Activa', 'En análisis', 'Atendida']
  const filtered = useMemo(() => alerts.filter(alert => {
    const tabOk = tab === 'activas' ? activeStatuses.includes(alert.status) : !activeStatuses.includes(alert.status)
    return tabOk && (!zoneFilter || alert.zoneId === Number(zoneFilter)) && (!sensorFilter || alert.sensorId === Number(sensorFilter)) && (!statusFilter || alert.status === statusFilter)
  }), [alerts, tab, zoneFilter, sensorFilter, statusFilter])
  const selected = alerts.find(alert => alert.id === selectedId) ?? filtered[0]
  const zone = selected && zones.find(item => item.id === selected.zoneId)
  const sensor = selected && sensors.find(item => item.id === selected.sensorId)
  const applyStatus = (status: AlertStatus) => { if (!selected || !observation.trim()) return; changeAlertStatus(selected.id, status, observation.trim()); setModal(null); setObservation('') }

  return <div className="page page--detail">
    <section className="content-card list-pane"><div className="page-tools"><Tabs items={[{ key: 'activas', label: 'Activas', count: alerts.filter(a => activeStatuses.includes(a.status)).length }, { key: 'historial', label: 'Historial', count: alerts.filter(a => !activeStatuses.includes(a.status)).length }]} active={tab} onChange={setTab}/><div className="toolbar-search"><Search /><input placeholder="Buscar alerta" /></div></div><div className="filter-bar"><Filter /><select aria-label="Filtrar por zona" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}><option value="">Todas las zonas</option>{zones.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><select aria-label="Filtrar por sensor" value={sensorFilter} onChange={e => setSensorFilter(e.target.value)}><option value="">Todos los sensores</option>{sensors.slice(0, 20).map(item => <option value={item.id} key={item.id}>{item.code}</option>)}</select><select aria-label="Filtrar por estado" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Todos los estados</option>{Object.keys(nextStates).map(item => <option key={item}>{item}</option>)}</select><input type="date" aria-label="Desde" defaultValue="2026-10-20"/><input type="date" aria-label="Hasta" defaultValue="2026-10-27"/><button onClick={() => { setZoneFilter(''); setSensorFilter(''); setStatusFilter('') }}>Limpiar</button></div><div className="active-filter-chips">{zoneFilter && <button onClick={() => setZoneFilter('')}>Zona: {zones.find(z => z.id === Number(zoneFilter))?.name} ×</button>}{statusFilter && <button onClick={() => setStatusFilter('')}>Estado: {statusFilter} ×</button>}</div><div className="data-table" role="table"><div className="data-table__head" role="row"><span>Nivel</span><span>Zona / sensor</span><span>Hora</span><span>Estado</span></div>{filtered.map(alert => { const z = zones.find(item => item.id === alert.zoneId)!; const s = sensors.find(item => item.id === alert.sensorId)!; return <button role="row" className={selected?.id === alert.id ? 'data-row data-row--selected' : 'data-row'} key={alert.id} onClick={() => setSelectedId(alert.id)}><span><RiskBadge level={alert.level}/></span><span><strong>{z.name}</strong><small>{s.code} · {s.type}</small></span><span>{new Date(alert.dateTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span><span><StatusChip tone={alert.status === 'Activa' ? 'danger' : alert.status === 'Cerrada' ? 'success' : 'info'}>{alert.status}</StatusChip></span></button> })}{filtered.length === 0 && <div className="table-empty">No hay alertas para los filtros aplicados.</div>}</div></section>
    {selected && <aside className="content-card detail-pane"><header><div><RiskBadge level={selected.level}/><h2>{zone?.name}</h2><p>{sensor?.code} · {sensor?.type}</p></div><StatusChip tone={selected.status === 'Activa' ? 'danger' : 'info'}>{selected.status}</StatusChip></header><div className="measurement-hero"><strong>{sensor?.lastValue} {sensor?.unit}</strong><span>{selected.description}</span></div><section><h3><History /> Historial de estados</h3><ol className="timeline">{selected.history.map(change => <li key={change.id}><i /><div><strong>{change.to}</strong><time><Clock3 /> {new Date(change.dateTime).toLocaleString('es-AR')}</time><p>{change.user} · {change.observation}</p></div></li>)}</ol></section>{!isReadOnly && nextStates[selected.status].length > 0 && <footer><Button variant="danger" onClick={() => setModal('discard')}>Descartar alerta</Button><Button onClick={() => { setNextStatus(nextStates[selected.status].filter(s => s !== 'Descartada')[0] ?? 'Descartada'); setModal('state') }}>Cambiar estado</Button></footer>}{isReadOnly && <div className="read-only-banner"><ShieldAlert /> Vista de consulta: tu rol no modifica alertas.</div>}</aside>}

    {modal === 'state' && <Modal title={`Cambiar la alerta a ${nextStatus}`} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button disabled={!observation.trim()} onClick={() => applyStatus(nextStatus)}>Cambiar estado</Button></>}><Field label="Siguiente estado" required><select value={nextStatus} onChange={e => setNextStatus(e.target.value as AlertStatus)}>{nextStates[selected.status].filter(s => s !== 'Descartada').map(status => <option key={status}>{status}</option>)}</select></Field><Field label="Observación" required hint={`${observation.length} / 255`}><textarea value={observation} maxLength={255} onChange={e => setObservation(e.target.value)} placeholder="Describí la acción realizada"/></Field></Modal>}
    {modal === 'discard' && <Modal destructive title={`¿Descartar la alerta de ${zone?.name}?`} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="danger" disabled={!observation.trim()} onClick={() => applyStatus('Descartada')}>Descartar alerta</Button></>}><p>La alerta pasará al historial. El cambio quedará registrado con tu usuario y podrá deshacerse desde la notificación.</p><Field label="Motivo del descarte" required hint={`${observation.length} / 255`}><textarea value={observation} maxLength={255} onChange={e => setObservation(e.target.value)} autoFocus/></Field></Modal>}
  </div>
}
