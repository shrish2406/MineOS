import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ModulePage } from './pages/ModulePage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function LandingRedirect() { const { user } = useAuth(); return <Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace /> }
function RoleAlias() { const { user } = useAuth(); return <Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace /> }
export default function App() { return <Routes><Route path="/" element={<LandingRedirect />} /><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route path="/:role/dashboard" element={<DashboardPage />} /><Route path="/:role/:module" element={<ModulePage />} /></Route><Route path="/dashboard" element={<RoleAlias />} /><Route path="/manager" element={<RoleAlias />} /><Route path="/safety" element={<RoleAlias />} /><Route path="/corporate" element={<RoleAlias />} /><Route path="/regulator" element={<RoleAlias />} /></Route><Route path="*" element={<LandingRedirect />} /></Routes> }
