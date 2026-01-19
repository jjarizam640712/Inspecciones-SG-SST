export type InspectionModule = 
  | 'SAFETY_CONDITIONS' 
  | 'FIRE_CABINETS' 
  | 'EXTINGUISHERS' 
  | 'STRETCHERS' 
  | 'FIRST_AID_KITS' 
  | 'SIGNAGE'
  | 'SAFE_WORK_INSPECTION'
  | 'HISTORY'
  | 'ADMIN_PANEL'
  | 'USER_PROFILE';

export type UserRole = 'USER' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  clientCode: string;
  buildingName: string;
  nit: string;
  address: string;
  legalRepresentative: string;
  inspectorName: string;
  email: string;
  alternativeEmail: string;
  phone: string;
  mobile: string;
  city: string;
  department: string;
  country: string;
  planType: 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' | 'NONE';
  subscriptionStatus: 'ACTIVO' | 'VENCIDO' | 'PENDIENTE';
  expiryDate: string;
  role: UserRole;
  createdAt: string;
}