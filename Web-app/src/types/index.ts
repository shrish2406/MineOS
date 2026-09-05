export const roles = ['manager', 'safety', 'corporate', 'regulator'] as const
export type Role = (typeof roles)[number]
export const backendRoles = ['admin', 'mine_manager', 'inspector', 'viewer'] as const
export type BackendRole = (typeof backendRoles)[number]
export type AppRole = Role | BackendRole
export interface User { name: string; email: string; role: AppRole }
export interface Mine { name: string; location: string; compliance: number; risk: 'High' | 'Medium' | 'Low'; openItems: number }
export interface ComplianceMetric { label: string; value: string; change: string; tone: 'blue' | 'red' | 'amber' | 'green' }
export interface Violation { id: string; mine: string; type: string; severity: 'High' | 'Medium' | 'Low'; status: 'Open' | 'Under review' | 'Resolved' }
export interface Inspection { id: string; mine: string; date: string; type: string; result: 'Compliant' | 'Observations' | 'Follow-up required' }
export interface CorrectiveAction { id: string; action: string; mine: string; owner: string; due: string; status: 'Overdue' | 'In progress' | 'Completed' }
export interface Alert { id: string; title: string; detail: string; severity: 'High' | 'Medium' | 'Info'; time: string }
export interface DashboardMetric extends ComplianceMetric { icon: string }
export interface NavItem { label: string; path: string; symbol: string }
