import { Check, CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import type { NoticeType, RiskLevel } from '../types'

export function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, ariaLabel }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; ariaLabel?: string }) {
  return <button className={`button button--${variant}`} onClick={onClick} type={type} disabled={disabled} aria-label={ariaLabel}>{children}</button>
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const names = { 1: 'Bajo', 2: 'Medio', 3: 'Alto', 4: 'Crítico' }
  return <span className={`risk-badge risk-badge--${level}`} aria-label={`Nivel ${level}: ${names[level]}`}><span aria-hidden="true">{'▮'.repeat(level)}{'▯'.repeat(4 - level)}</span> {names[level]}</span>
}

export function StatusChip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }) {
  return <span className={`status-chip status-chip--${tone}`}>{children}</span>
}

export function Tabs({ items, active, onChange }: { items: Array<{ key: string; label: string; count?: number }>; active: string; onChange: (key: string) => void }) {
  return <div className="tabs" role="tablist">{items.map(item => <button key={item.key} role="tab" aria-selected={active === item.key} className={`tab ${active === item.key ? 'tab--active' : ''}`} onClick={() => onChange(item.key)}>{item.label}{item.count !== undefined && <span>{item.count}</span>}</button>)}</div>
}

export function Modal({ title, children, onClose, footer, destructive = false }: { title: string; children: ReactNode; onClose: () => void; footer: ReactNode; destructive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); previous?.focus() }
  }, [onClose])
  return <div className="modal-backdrop" role="presentation"><div className={`modal ${destructive ? 'modal--destructive' : ''}`} ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><div><p className="eyebrow">{destructive ? 'ACCIÓN DESTRUCTIVA' : 'FORMULARIO'}</p><h2 id="modal-title">{title}</h2></div></header><div className="modal__content">{children}</div><footer>{footer}</footer><p className="modal__shortcut">Esc cancela{!destructive && ' · Enter confirma'}</p></div></div>
}

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return <label className={`field ${error ? 'field--error' : ''}`}><span>{label} <small>({required ? 'obligatorio' : 'opcional'})</small></span>{children}{hint && <small className="field__hint">{hint}</small>}{error && <small className="field__error"><CircleAlert size={14} />{error}</small>}</label>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><Info size={28} /><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function noticeIcon(type: NoticeType) {
  if (type === 'success') return <CircleCheck />
  if (type === 'warning') return <TriangleAlert />
  if (type === 'error' || type === 'alert') return <CircleAlert />
  return <Info />
}

export function Toast({ type, title, message, onClose, action }: { type: NoticeType; title: string; message: string; onClose: () => void; action?: { label: string; onClick: () => void } }) {
  return <div className={`toast toast--${type}`} role={type === 'error' || type === 'alert' ? 'alert' : 'status'}><div className="toast__icon">{noticeIcon(type)}</div><div><strong>{title}</strong><p>{message}</p>{action && <button onClick={action.onClick}>{action.label}</button>}</div><button className="icon-button" onClick={onClose} aria-label="Cerrar notificación"><X /></button></div>
}

export function ConfirmForm({ onSubmit, children }: { onSubmit: () => void; children: ReactNode }) {
  return <form onSubmit={(event: FormEvent) => { event.preventDefault(); onSubmit() }}>{children}</form>
}

export const checkedIcon = <Check size={16} aria-hidden="true" />
