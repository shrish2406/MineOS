import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'

const titleMap: Record<string, string> = { dashboard: 'Overview', compliance: 'Compliance', inspections: 'Inspections', violations: 'Violations', actions: 'Corrective actions', reports: 'Reports', alerts: 'Alerts', contractors: 'Contractors', safety: 'Safety observations', incidents: 'Incidents', performance: 'Mine performance', risk: 'Risk monitoring', monitoring: 'Mine monitoring', records: 'Regulatory records', settings: 'Settings' }
export function AppLayout() { const [open, setOpen] = useState(false); const page = useLocation().pathname.split('/').pop() ?? 'dashboard'; return <div className="min-h-screen bg-slate-50"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-72"><Header title={titleMap[page] ?? 'MINSOS'} onMenu={() => setOpen(true)} /><main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div> }
