import { apiClient } from './api'
import type { WorkflowAction, WorkflowInspection, WorkflowViolation } from '../types'

export interface PageResult<T> { data: T[]; page: number; limit: number; total: number }
export interface DashboardSummary { totalMines: number; compliancePercent: number | null; openViolations: number; criticalViolations: number; overdueActions: number; riskScore: number | null; generatedAt: string }
export interface InspectionDetail extends WorkflowInspection { violations: WorkflowViolation[]; actions: WorkflowAction[] }
export interface WorkflowLookup { id: string; name: string; label?: string; role?: string; code?: string }

type ApiRecord = Record<string, unknown> & { _id?: string; id?: string }
type ApiPage = { data: ApiRecord[]; page: number; limit: number; total: number }

function idOf(record: ApiRecord): string { return record.id ?? record._id ?? '' }
function displayDate(value: unknown): string { return value ? new Date(String(value)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '' }
function titleCase(value: unknown): string { return String(value ?? '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function relatedName(value: unknown, fallback: string): string {
  if (value && typeof value === 'object') { const record = value as ApiRecord; return String(record.name ?? record.email ?? fallback) }
  return fallback
}

function mapInspection(record: ApiRecord): WorkflowInspection {
  const mine = record.mineId as ApiRecord | undefined
  const gps = record.gps as { latitude?: number; longitude?: number } | undefined
  return { id: idOf(record), mine: relatedName(mine, 'Mine'), mineCode: String(mine?.code ?? ''), type: String(record.type ?? ''), scheduledFor: displayDate(record.scheduledFor), completedOn: record.completedOn ? displayDate(record.completedOn) : undefined, inspector: relatedName(record.inspectorId, 'Inspector'), status: titleCase(record.status) as WorkflowInspection['status'], location: String(record.location ?? ''), latitude: gps?.latitude ?? 0, longitude: gps?.longitude ?? 0, observations: String(record.observations ?? ''), photoCount: Array.isArray(record.evidence) ? record.evidence.length : 0, violationCount: Number(record.violationCount ?? 0), actionCount: Number(record.actionCount ?? 0) }
}

function mapViolation(record: ApiRecord): WorkflowViolation {
  const mine = record.mineId as ApiRecord | undefined
  return { id: idOf(record), inspectionId: typeof record.inspectionId === 'object' ? idOf(record.inspectionId as ApiRecord) : String(record.inspectionId ?? ''), mine: relatedName(mine, 'Mine'), title: String(record.title ?? ''), description: String(record.description ?? ''), category: String(record.category ?? ''), severity: titleCase(record.severity) as WorkflowViolation['severity'], status: titleCase(record.status) as WorkflowViolation['status'], assignedTo: relatedName(record.assignedTo, 'Unassigned'), deadline: displayDate(record.deadline), evidenceCount: Number(record.evidenceCount ?? (Array.isArray(record.evidence) ? record.evidence.length : 0)) }
}

function mapAction(record: ApiRecord): WorkflowAction {
  return { id: idOf(record), violationId: typeof record.violationId === 'object' ? idOf(record.violationId as ApiRecord) : String(record.violationId ?? ''), inspectionId: typeof record.inspectionId === 'object' ? idOf(record.inspectionId as ApiRecord) : String(record.inspectionId ?? ''), mine: relatedName(record.mineId, 'Mine'), title: String(record.title ?? ''), responsiblePerson: relatedName(record.responsiblePersonId, 'Unassigned'), deadline: displayDate(record.deadline), status: titleCase(record.status) as WorkflowAction['status'], evidenceCount: Number(record.evidenceCount ?? (Array.isArray(record.evidence) ? record.evidence.length : 0)), verificationNote: (record.verification as ApiRecord | undefined)?.note as string | undefined }
}

export const workflowService = {
  async inspections(params?: Record<string, string | number | undefined>): Promise<PageResult<WorkflowInspection>> { const { data } = await apiClient.get<ApiPage>('/inspections', { params }); return { ...data, data: data.data.map(mapInspection) } },
  async inspection(id: string): Promise<InspectionDetail> { const { data } = await apiClient.get<ApiRecord>(`/inspections/${id}`); return { ...mapInspection(data), violations: ((data.violations as ApiRecord[] | undefined) ?? []).map(mapViolation), actions: ((data.correctiveActions as ApiRecord[] | undefined) ?? []).map(mapAction) } },
  async violations(params?: Record<string, string | number | undefined>): Promise<PageResult<WorkflowViolation>> { const { data } = await apiClient.get<ApiPage>('/violations', { params }); return { ...data, data: data.data.map(mapViolation) } },
  async actions(params?: Record<string, string | number | undefined>): Promise<PageResult<WorkflowAction>> { const { data } = await apiClient.get<ApiPage>('/corrective-actions', { params }); return { ...data, data: data.data.map(mapAction) } },
  createInspection: (payload: Record<string, unknown>) => apiClient.post('/inspections', payload),
  createViolation: (payload: Record<string, unknown>) => apiClient.post('/violations', payload),
  createAction: (payload: Record<string, unknown>) => apiClient.post('/corrective-actions', payload),
  updateViolation: (id: string, payload: Record<string, unknown>) => apiClient.patch(`/violations/${id}`, payload),
  updateAction: (id: string, payload: Record<string, unknown>) => apiClient.patch(`/corrective-actions/${id}`, payload),
  verifyAction: (id: string, note?: string) => apiClient.patch(`/corrective-actions/${id}/verify`, { note }),
  dashboardSummary: async () => (await apiClient.get<DashboardSummary>('/dashboard/summary')).data,
  mines: async (): Promise<WorkflowLookup[]> => (await apiClient.get<Array<{ _id: string; name: string; code: string }>>('/mines')).data.map((mine) => ({ id: mine._id, name: mine.name, code: mine.code, label: `${mine.name} (${mine.code})` })),
  users: async (role?: string): Promise<WorkflowLookup[]> => (await apiClient.get<Array<{ id: string; name: string; email: string; role: string }>>('/users', { params: role ? { role } : undefined })).data.map((user) => ({ id: user.id, name: user.name, role: user.role, label: `${user.name} (${user.email})` })),
}
