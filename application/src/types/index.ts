export type UserRole = 'admin' | 'mine_manager' | 'inspector' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Mine {
  _id: string;
  name: string;
  code: string;
  location: string;
  operator: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMinePayload {
  name: string;
  code: string;
  location: string;
  operator: string;
}

export interface UpdateMinePayload {
  name?: string;
  code?: string;
  location?: string;
  operator?: string;
  status?: 'active' | 'inactive';
}

export type InspectionType =
  | 'ventilation'
  | 'ppe_compliance'
  | 'dust_monitoring'
  | 'equipment_safety'
  | 'emergency_exits';

export type ComplianceStatus = 'pass' | 'fail' | 'partial';

export interface InspectionFormData {
  type: InspectionType;
  status: ComplianceStatus;
  observations: string;
  inspectorName: string;
  mineId: string;
  mineName: string;
  submittedAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddMine: undefined;
  SelectMine: undefined;
  StartInspection: undefined;
};

export function canManageMines(role: UserRole): boolean {
  return role === 'admin' || role === 'mine_manager';
}

export function canDeleteMines(role: UserRole): boolean {
  return role === 'admin';
}
