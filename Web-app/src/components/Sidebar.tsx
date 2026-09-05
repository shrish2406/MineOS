import { NavLink } from 'react-router-dom'
import { roleDetails } from '../data/mockUsers'
import { useAuth } from '../context/AuthContext'
import type { NavItem } from '../types'

const baseItems: NavItem[] = [{ label: 'Overview', path: 'dashboard', symbol: '▦' }, { label: 'Compliance', path: 'compliance', symbol: '✓' }, { label: 'Inspections', path: 'inspections', symbol: '⌕' }, { label: 'Violations', path: 'violations', symbol: '!' }, { label: 'Corrective actions', path: 'actions', symbol: '↗' }, { label: 'Reports', path: 'reports', symbol: '▤' }]
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  if (!user) return null
  const role = user.role
  const specific: NavItem[] = role === 'safety' || role === 'inspector' ? [{ label: 'Safety observations', path: 'safety', symbol: '◉' }, { label: 'Incidents', path: 'incidents', symbol: '△' }] : role === 'corporate' ? [{ label: 'Mine performance', path: 'performance', symbol: '▥' }, { label: 'Risk monitoring', path: 'risk', symbol: '◈' }] : role === 'regulator' || role === 'viewer' ? [{ label: 'Mine monitoring', path: 'monitoring', symbol: '◌' }, { label: 'Regulatory records', path: 'records', symbol: '▤' }] : [{ label: 'Alerts', path: 'alerts', symbol: '◌' }, { label: 'Contractors', path: 'contractors', symbol: '♙' }]
  const items = [...baseItems.slice(0, 3), ...specific, ...baseItems.slice(3)]
  return <><button aria-label="Close navigation" onClick={onClose} className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? '' : 'hidden'}`} /><aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-minsos-900 text-slate-100 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : ''}`}>
    <div className="border-b border-white/10 px-5 py-5"><div className="flex items-center gap-3"><img className="h-11 w-11 rounded-lg object-cover" src="/logo.jpeg" alt="MINSOS logo" /><div><p className="text-base font-bold tracking-[.16em]">MINSOS</p><p className="mt-0.5 text-xs text-slate-400">Governance platform</p></div></div></div>
    <div className="mx-4 mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-3"><p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active workspace</p><p className="mt-1 text-sm font-semibold">{roleDetails[role].label}</p></div>
    <nav aria-label="Main navigation" className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">{items.map((item) => <NavLink onClick={onClose} key={item.path} to={`/${role}/${item.path}`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><span className="w-4 text-center text-base" aria-hidden>{item.symbol}</span>{item.label}</NavLink>)}</nav>
    <div className="border-t border-white/10 p-3"><NavLink onClick={onClose} to={`/${role}/settings`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><span aria-hidden>⚙</span>Settings</NavLink><button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><span aria-hidden>↪</span>Sign out</button></div>
  </aside></>
}
