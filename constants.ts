import { AlertTriangle, Flame, ShieldAlert, LifeBuoy, BriefcaseMedical, Navigation, ShieldCheck, History } from 'lucide-react';

export const SUPABASE_URL = "https://iaarbauxmderavtnenqy.supabase.co"; 
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXJiYXV4bWRlcmF2dG5lbnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDM4NTQsImV4cCI6MjA3OTQ3OTg1NH0.ykkY0C1r93gsbHUQtkX10qjcUkLXDDgVJ8RbEVmJJ5Q";

export const NAVIGATION_MENU = [
  { id: 'SAFETY_CONDITIONS', label: 'Inspecciones de Seguridad', icon: AlertTriangle },
  { id: 'FIRE_CABINETS', label: 'Inspecciones de Gabinetes', icon: Flame },
  { id: 'EXTINGUISHERS', label: 'Inspecciones de Extintores', icon: ShieldAlert },
  { id: 'STRETCHERS', label: 'Inspecciones de Camilla', icon: LifeBuoy },
  { id: 'FIRST_AID_KITS', label: 'Inspecciones de Botiquín', icon: BriefcaseMedical },
  { id: 'SIGNAGE', label: 'Inspecciones de Señalización', icon: Navigation },
  { id: 'HISTORY', label: 'Historial de Registros', icon: History },
] as const;

export const DANGER_OPTIONS = ['Físico', 'Químico', 'Biológico', 'Psicosocial', 'Biomecánicos', 'Condiciones de Seguridad', 'Fenómenos Naturales'];
export const RISK_LEVEL_OPTIONS = ['Bajo', 'Medio', 'Alto', 'Crítico'];
export const CABINET_STATES = ['Bueno', 'Malo', 'No aplica'];
export const SIGNAL_TYPES = ['Evacuación', 'Prohibitiva', 'Informativa', 'Obligación', 'Contra incendios'];