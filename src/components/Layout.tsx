import { Activity, Bell, BellRing, Building2, ChartNoAxesCombined, Gauge, HelpCircle, Map, MapPinned, Menu, RadioTower, Search, Settings2, ShieldAlert, SlidersHorizontal, Users, Waves, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useDemoStore } from '../store/DemoStore'
import type { PageKey } from '../types'
import { Button, Modal, Toast, noticeIcon } from './UI'

const nav: Array<{ group: string; items: Array<{ key: PageKey; label: string; icon: typeof Map; adminOnly?: boolean }> }> = [
  { group: 'MONITOREO', items: [
    { key: 'mapa', label: 'Mapa de situación', icon: Map },
    { key: 'alertas', label: 'Alertas', icon: ShieldAlert },
    { key: 'mediciones', label: 'Mediciones', icon: Activity },
    { key: 'resumen', label: 'Resumen', icon: ChartNoAxesCombined },
  ] },
  { group: 'CONFIGURACIÓN', items: [
    { key: 'zonas', label: 'Zonas de riesgo', icon: MapPinned },
    { key: 'sensores', label: 'Sensores', icon: RadioTower },
    { key: 'umbrales', label: 'Umbrales', icon: SlidersHorizontal },
    { key: 'refugios', label: 'Refugios', icon: Building2 },
    { key: 'usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
  ] },
]

const titles: Record<PageKey, [string, string]> = {
  mapa: ['Mapa de situación', 'Zonas, sensores, refugios y alertas activas'],
  alertas: ['Alertas', 'Seguimiento, filtros e historial de estados'],
  mediciones: ['Mediciones', 'Historial y simulación de sensores'],
  resumen: ['Resumen de situación', 'Información estratégica del período'],
  zonas: ['Zonas de riesgo', 'Geometrías circulares y sensores asociados'],
  sensores: ['Sensores', 'Estado operativo y ubicación geográfica'],
  umbrales: ['Umbrales', 'Límites por zona y tipo de sensor'],
  refugios: ['Refugios', 'Puntos informativos georreferenciados'],
  usuarios: ['Usuarios', 'Roles, permisos y estado de acceso'],
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, page, setPage, logout, alerts, notices, markNoticeRead, markAllNoticesRead, removeNotice, resetDemo } = useDemoStore()
  const [drawer, setDrawer] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const unread = notices.filter(n => !n.read).length
  const activeAlerts = alerts.filter(a => ['Activa', 'En análisis', 'Atendida'].includes(a.status)).length
  const visibleToasts = useMemo(() => notices.filter(n => !n.read && (n.persistent || n.id > 1_000_000_000_000)).slice(0, 3), [notices])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus() }
      if (event.altKey && ['1', '2', '3', '4'].includes(event.key)) { event.preventDefault(); setPage((['mapa', 'alertas', 'mediciones', 'resumen'] as PageKey[])[Number(event.key) - 1]) }
      if (event.altKey && event.key.toLowerCase() === 'n') { event.preventDefault(); setDrawer(true) }
      if (event.key === '?' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) setShortcuts(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setPage])

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand"><div className="brand__mark"><Waves /></div><div><strong>SIGRI</strong><small>Defensa Civil · La Plata</small></div></div>
      <nav>{nav.map(group => <div className="nav-group" key={group.group}><p>{group.group}</p>{group.items.filter(item => !item.adminOnly || currentUser?.role === 'ADMINISTRADOR').map(item => {
        const Icon = item.icon
        return <button key={item.key} className={page === item.key ? 'nav-item nav-item--active' : 'nav-item'} onClick={() => setPage(item.key)}><Icon /><span>{item.label}</span>{item.key === 'alertas' && <b>{activeAlerts}</b>}</button>
      })}</div>)}</nav>
      <div className="sidebar__footer"><div className="user-avatar">{currentUser?.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div><div><strong>{currentUser?.name}</strong><small>{roleLabel(currentUser?.role)}</small><button onClick={logout}>Cerrar sesión</button></div></div>
    </aside>
    <section className="workspace">
      <header className="topbar"><div><h1>{titles[page][0]}</h1><p>{titles[page][1]}</p></div><div className="topbar__actions"><span className="live-indicator"><i /> Datos en vivo · 01:42</span><label className="global-search"><Search /><input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar zona, sensor o refugio" aria-label="Buscar zona, sensor o refugio"/><kbd>Ctrl K</kbd></label><button className="icon-button notification-button" onClick={() => setDrawer(true)} aria-label={`${unread} notificaciones sin leer`}><Bell />{unread > 0 && <span>{unread}</span>}</button><button className="icon-button" onClick={() => setShortcuts(true)} aria-label="Ver atajos"><HelpCircle /></button></div></header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="statusbar"><span><Gauge /> Simulación disponible</span><span><i className="sync-dot" /> Sincronización local</span><span>Alt+1 Mapa · Alt+2 Alertas · Ctrl+K Buscar · ? Atajos</span><button onClick={resetDemo}>Restablecer datos</button></footer>
    </section>

    {drawer && <div className="drawer-backdrop" onMouseDown={() => setDrawer(false)}><aside className="notification-drawer" onMouseDown={e => e.stopPropagation()} aria-label="Centro de notificaciones"><header><div><p className="eyebrow">CENTRO DE AVISOS</p><h2>Notificaciones</h2></div><button className="icon-button" onClick={() => setDrawer(false)} aria-label="Cerrar"><X /></button></header><div className="notification-toolbar"><span>{unread} sin leer</span><button onClick={markAllNoticesRead}>Marcar todas como leídas</button></div><div className="notification-list">{notices.map(notice => <article className={`notice-card notice-card--${notice.type} ${notice.read ? 'notice-card--read' : ''}`} key={notice.id}><div className="notice-card__icon">{noticeIcon(notice.type)}</div><div><header><strong>{notice.title}</strong><time>{notice.time}</time></header><p>{notice.message}</p><div className="notice-card__actions">{!notice.read && <button onClick={() => markNoticeRead(notice.id)}>Marcar como leída</button>}{notice.actionLabel && <button className="link-strong" onClick={() => { markNoticeRead(notice.id); if (notice.alertId) setPage('alertas'); setDrawer(false) }}>{notice.actionLabel}</button>}</div></div><button className="icon-button" onClick={() => removeNotice(notice.id)} aria-label="Eliminar notificación"><X /></button></article>)}</div></aside></div>}

    <div className="toast-stack" aria-live="polite">{visibleToasts.map(notice => <Toast key={notice.id} type={notice.type} title={notice.title} message={notice.message} onClose={() => markNoticeRead(notice.id)} action={notice.actionLabel ? { label: notice.actionLabel, onClick: () => { markNoticeRead(notice.id); if (notice.alertId) setPage('alertas') } } : undefined} />)}</div>

    {shortcuts && <Modal title="Atajos de teclado" onClose={() => setShortcuts(false)} footer={<Button onClick={() => setShortcuts(false)}>Cerrar</Button>}><div className="shortcut-grid"><kbd>Ctrl + K</kbd><span>Buscar</span><kbd>Alt + 1–4</kbd><span>Ir a Mapa, Alertas, Mediciones o Resumen</span><kbd>Alt + N</kbd><span>Abrir notificaciones</span><kbd>?</kbd><span>Mostrar esta ayuda</span><kbd>Esc</kbd><span>Cerrar modales y paneles</span></div></Modal>}
  </div>
}

function roleLabel(role?: string) {
  if (role === 'ADMINISTRADOR') return 'Administrador'
  if (role === 'AUTORIDAD') return 'Autoridad Municipal'
  return 'Operador de Defensa Civil'
}
