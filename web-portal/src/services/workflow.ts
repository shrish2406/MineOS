import { apiClient } from './api'
import type { WorkflowAction, WorkflowInspection, WorkflowViolation } from '../types'

/** Day 2 API boundary; workflow pages stay on demo data until the contract is live. */
export interface PageResult<T> { data: T[]; page: number; limit: number; total: number }
export interface DashboardSummary { totalMines: number; compliancePercent: number | null; openViolations: number; criticalViolations: number; overdueActions: number; riskScore: number | null; generatedAt: string }

export const workflowService = {
  inspections: (params?: Record<string, string | number | undefined>) => apiClient.get<PageResult<WorkflowInspection>>('/inspections', { params }),
  inspection: (id: string) => apiClient.get<WorkflowInspection>(`/inspections/${id}`),
  violations: (params?: Record<string, string | number | undefined>) => apiClient.get<PageResult<WorkflowViolation>>('/violations', { params }),
  actions: (params?: Record<string, string | number | undefined>) => apiClient.get<PageResult<WorkflowAction>>('/corrective-actions', { params }),
  verifyAction: (id: string, note?: string) => apiClient.patch<WorkflowAction>(`/corrective-actions/${id}/verify`, { note }),
  dashboardSummary: () => apiClient.get<DashboardSummary>('/dashboard/summary'),
}
