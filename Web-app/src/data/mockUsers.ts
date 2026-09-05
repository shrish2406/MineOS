import type { AppRole, Role, User } from '../types'

export const roleDetails: Record<AppRole, { label: string; description: string; greeting: string }> = {
  manager: { label: 'Mine Manager', description: 'Operational compliance and corrective action oversight.', greeting: 'Mine operations at a glance' },
  safety: { label: 'Safety Officer', description: 'Safety observations, inspections and incident readiness.', greeting: 'Safety controls requiring attention' },
  corporate: { label: 'Corporate', description: 'Enterprise-level performance and governance monitoring.', greeting: 'Enterprise compliance overview' },
  regulator: { label: 'Regulator', description: 'Independent compliance and regulatory monitoring.', greeting: 'Regulatory monitoring overview' },
  admin: { label: 'Administrator', description: 'Backend-issued administrative access.', greeting: 'Governance operations overview' },
  mine_manager: { label: 'Mine Manager', description: 'Backend-issued mine management access.', greeting: 'Mine operations at a glance' },
  inspector: { label: 'Inspector', description: 'Backend-issued inspection access.', greeting: 'Inspection and safety controls' },
  viewer: { label: 'Viewer', description: 'Backend-issued read-only access.', greeting: 'Governance monitoring overview' },
}

export const createMockUser = (email: string, role: Role): User => ({ name: roleDetails[role].label, email, role })
