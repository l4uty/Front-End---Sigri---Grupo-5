import { AlertTriangle, CalendarDays, Download, RadioTower, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, RiskBadge, StatusChip, Tabs } from '../components/UI'
import { useDemoStore } from '../store/DemoStore'

export function SummaryPage() {
  const { alerts, sensors, zones } = useDemoStore()
  const [chart, setChart] = useState('barras')
  const [period, setPeriod] = useState('Últimos 7 días y hoy')
  const levelCounts = [1, 2, 3, 4].map(level => alerts.filter(a => a.level === level).length)
  const active = alerts.filter(a => ['Activa', 'En análisis', 'Atendida'].includes(a.status)).length
  const down = sensors.filter(s => s.status !== 'Activo' && s.status !== 'Baja')
  const days = [3, 4, 5, 6, 7, 9, 5, 3]
  const zoneRanking = useMemo(() => zones.map(zone => ({ zone, count: alerts.filter(a => a.zoneId === zone.id).length })).sort((a, b) => b.count - a.count).slice(0, 5), [zones, alerts])

  return <div className="page page--stack summary-page">
    <div className="summary-toolbar">
      <label><CalendarDays /> Período<select value={period} onChange={e => setPeriod(e.target.value)}><option>Últimos 7 días y hoy</option><option>Últimas 24 horas</option><option>Últimos 30 días</option></select></label>
      <Button variant="secondary" onClick={() => window.print()}><Download /> Imprimir resumen</Button>
    </div>
    <div className="kpi-grid">
      <Kpi icon={<ShieldAlert />} label="Alertas del período" value={alerts.length} detail="20/10 al 27/10"/>
      <Kpi icon={<AlertTriangle />} label="Alertas activas" value={active} detail="2 críticas · 2 altas · 1 media" critical/>
      <Kpi icon={<RadioTower />} label="Sensores activos" value={sensors.filter(s => s.status === 'Activo').length} detail={`de ${sensors.length} registrados`}/>
      <Kpi icon={<RadioTower />} label="Sin informar" value={down.length} detail="requieren revisión"/>
    </div>
    <div className="chart-grid">
      <section className="content-card chart-card chart-card--wide">
        <header>
          <div><h2>El domingo 25/10 concentró la mayor cantidad</h2><p>Alertas diarias por nivel · {period}</p></div>
          <Tabs items={[{ key: 'barras', label: 'Barras' }, { key: 'tabla', label: 'Tabla' }]} active={chart} onChange={setChart}/>
        </header>
        {chart === 'tabla' ? <table className="accessible-table">
          <thead><tr><th>Día</th><th>Alertas</th></tr></thead>
          <tbody>{days.map((value, index) => <tr key={index}><td>{20 + index}/10</td><td>{value}</td></tr>)}</tbody>
        </table> : <div className="bar-chart">
          {days.map((value, index) => <div className="bar-chart__column" key={index}><span>{value}</span><i style={{ height: `${value * 18}px` }} title={`${20 + index}/10 · ${value} alertas`}/><small>{20 + index}/10</small></div>)}
        </div>}
      </section>
      <section className="content-card chart-card"><header><div><h2>La mitad fueron críticas</h2><p>Distribución por nivel</p></div></header><div className="level-bars">{[4, 3, 2, 1].map(level => <div key={level}><RiskBadge level={level as 1 | 2 | 3 | 4}/><span><i className={`level-fill level-fill--${level}`} style={{ width: `${(levelCounts[level - 1] / alerts.length) * 100}%` }}/></span><strong>{levelCounts[level - 1]}</strong></div>)}</div></section>
      <section className="content-card chart-card"><header><div><h2>Ringuelet concentra más eventos</h2><p>Ranking por zona</p></div></header><div className="ranking-list">{zoneRanking.map(({ zone, count }, index) => <div key={zone.id}><b>{index + 1}</b><span><strong>{zone.name}</strong><RiskBadge level={zone.risk}/></span><em style={{ width: `${Math.max(18, count * 18)}px` }}/><small>{count}</small></div>)}</div></section>
      <section className="content-card chart-card"><header><div><h2>Cuatro sensores no informan</h2><p>Prioridad operativa</p></div></header><div className="down-list">{down.map(sensor => <div key={sensor.id}><span><strong>{sensor.code}</strong><small>{sensor.type}</small></span><StatusChip tone="warning">{sensor.status}</StatusChip><time>{sensor.lastReport}</time></div>)}</div></section>
    </div>
  </div>
}

function Kpi({ icon, label, value, detail, critical }: { icon: React.ReactNode; label: string; value: number; detail: string; critical?: boolean }) {
  return <article className={`kpi-card ${critical ? 'kpi-card--critical' : ''}`}><span>{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>
}
