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
  | 'routine_safety_audit'
  | 'ventilation'
  | 'ppe_compliance'
  | 'dust_monitoring'
  | 'equipment_safety'
  | 'emergency_exits';

export type ComplianceStatus = 'pass' | 'fail' | 'partial';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChecklistItemId = 'ppe_compliance' | 'emergency_exits' | 'fire_extinguisher';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ViolationEvidence {
  observationNotes: string;
  severity: SeverityLevel;
  photoUri?: string;
  gps?: GpsCoordinates;
}

export interface ChecklistItemResult {
  id: ChecklistItemId;
  label: string;
  description: string;
  status: ComplianceStatus;
  violation?: ViolationEvidence;
}

export interface InspectionRecord {
  id: string;
  mineId: string;
  mineName: string;
  inspectorId: string;
  inspectorName: string;
  inspectionType: InspectionType;
  checklistItems: ChecklistItemResult[];
  submittedAt: string;
}

export interface HazardReport {
  id: string;
  description: string;
  photoUri?: string;
  gps: GpsCoordinates;
  reporterId: string;
  reporterName: string;
  submittedAt: string;
}

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
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Inspections: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  AddMine: undefined;
};

export type InspectionStackParamList = {
  SelectMine: undefined;
  StartInspection: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  HazardReport: undefined;
};

export function canManageMines(role: UserRole): boolean {
  return role === 'admin' || role === 'mine_manager';
}

export function canDeleteMines(role: UserRole): boolean {
  return role === 'admin';
}
