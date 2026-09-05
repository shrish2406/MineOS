import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() { const { user } = useAuth(); const { role } = useParams(); if (!user) return <Navigate to="/login" replace />; if (role && role !== user.role) return <Navigate to={`/${user.role}/dashboard`} replace />; return <Outlet /> }
