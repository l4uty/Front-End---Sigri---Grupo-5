import { LockKeyhole, MapPinned, ShieldCheck, Waves } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDemoStore } from '../store/DemoStore'
import { Button } from '../components/UI'

export function LoginPage() {
  const { login, loginAs, users } = useDemoStore()
  const [username, setUsername] = useState('lucia')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!login(username)) setError('El usuario no existe o está inactivo.') }
  return <main className="login-page">
    <section className="login-hero"><div className="login-hero__overlay"><div className="brand brand--light"><div className="brand__mark"><Waves /></div><strong>SIGRI</strong></div><div><span className="hero-tag"><ShieldCheck /> Monitoreo territorial</span><h1>Decisiones claras ante el riesgo de inundaciones.</h1><p>Zonas, sensores, alertas y refugios en una sola vista georreferenciada para La Plata.</p></div><div className="hero-facts"><div><MapPinned /><strong>12</strong><span>zonas vigiladas</span></div><div><Waves /><strong>42</strong><span>sensores registrados</span></div></div></div></section>
    <section className="login-panel"><form className="login-card" onSubmit={submit}><div className="login-card__icon"><LockKeyhole /></div><p className="eyebrow">ACCESO SEGURO</p><h2>Iniciar sesión</h2><p>Ingresá con un usuario precargado. La contraseña de demostración es <strong>demo</strong>.</p><label>Usuario<input value={username} onChange={e => { setUsername(e.target.value); setError('') }} autoComplete="username" /></label><label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit">Ingresar a SIGRI</Button><div className="demo-users"><span>Accesos rápidos</span>{users.filter(u => u.active).map(user => <button type="button" key={user.id} onClick={() => loginAs(user)}><strong>{user.name}</strong><small>{user.role === 'OPERADOR' ? 'Operador de Defensa Civil' : user.role === 'AUTORIDAD' ? 'Autoridad Municipal' : 'Administrador'}</small></button>)}</div></form></section>
  </main>
}
