
import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, Building2, MapPin, Phone, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    buildingName: '',
    nit: '',
    address: '',
    legalRepresentative: '',
    inspectorName: '',
    email: '',
    alternativeEmail: '',
    phone: '',
    mobile: '',
    city: '',
    department: '',
    country: 'Colombia',
    planType: 'MENSUAL' as const,
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginEmail === 'jjarizam@gmail.com' && loginPassword === 'Seguridad1234#') {
      const admin: UserProfile = {
        id: 'admin',
        clientCode: 'ADMIN-001',
        buildingName: 'Panel Administrativo',
        nit: 'N/A',
        address: 'Sistema Central',
        legalRepresentative: 'J. Ariza',
        inspectorName: 'Admin',
        email: 'jjarizam@gmail.com',
        alternativeEmail: '',
        phone: '',
        mobile: '',
        city: 'Barranquilla',
        department: 'Atlántico',
        country: 'Colombia',
        planType: 'NONE',
        subscriptionStatus: 'ACTIVO',
        expiryDate: '2099-12-31',
        role: 'SUPER_ADMIN',
        createdAt: new Date().toISOString()
      };
      onLogin(admin);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', loginEmail)
        .eq('password', loginPassword)
        .single();

      if (error || !data) throw new Error("Credenciales inválidas");
      onLogin(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const nextNum = (count || 0) + 1;
      const clientCode = `ED-${nextNum.toString().padStart(4, '0')}`;

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      const newUser: Partial<UserProfile> = {
        ...regData,
        clientCode,
        subscriptionStatus: 'ACTIVO',
        expiryDate: expiry.toISOString().split('T')[0],
        role: 'USER',
        createdAt: new Date().toISOString()
      };

      const { data, error } = await supabase.from('user_profiles').insert([newUser]).select().single();
      if (error) throw error;

      alert(`¡Registro exitoso! Su código de cliente es: ${clientCode}`);
      onLogin(data);
    } catch (err: any) {
      alert(`Error al registrar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-white to-blue-50 flex items-center justify-center p-0 md:p-6 lg:p-12 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-10">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#1e3a8a] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 border border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="bg-white p-3 rounded-[1.5rem] shadow-2xl flex items-center justify-center">
                <ShieldCheck size={48} className="text-[#1e3a8a]" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter leading-none">SG-SST Suite</h1>
                <p className="text-[14px] font-black text-blue-300 uppercase tracking-[0.3em] mt-1">INSPECCIONES PRO</p>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-3 bg-blue-600/30 border border-blue-400/30 px-4 py-1.5 rounded-full mb-8">
               <Building2 size={14} className="text-blue-200" />
               <p className="text-[11px] font-black text-blue-100 uppercase tracking-widest">Propiedad Horizontal</p>
            </div>

            <h2 className="text-5xl font-black leading-[1.1] mb-6 tracking-tight">Seguridad Profesional para su Copropiedad.</h2>
            <p className="text-blue-100 text-xl font-black uppercase tracking-tight mb-8 opacity-90 border-l-4 border-blue-400 pl-4">Gestión de Inspecciones SG-SST</p>
            
            <div className="space-y-4 max-w-sm">
               <p className="text-blue-200 text-sm font-medium leading-relaxed">
                 Estandarización técnica para la prevención de riesgos en infraestructuras de uso residencial y comercial.
               </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 mt-12">
             <p className="text-[11px] font-bold text-blue-300 uppercase tracking-[0.1em]">Derechos Reservados de : Top Live S.A.S Edición 2025</p>
          </div>
        </div>

        <div className="p-8 md:p-14 lg:p-16 overflow-y-auto max-h-[100vh] lg:max-h-[90vh] no-scrollbar flex flex-col bg-white">
          
          <div className="mb-12 flex items-center gap-5 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm self-start">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm flex items-center justify-center min-w-[50px] min-h-[50px] border border-slate-100">
              <ShieldCheck size={32} className="text-[#1e3a8a]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-[#1e3a8a] leading-none tracking-tighter">SG-SST Suite</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">INSPECCIONES PRO</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tight">Propiedad Horizontal</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.15em] border-b-2 border-blue-600 inline-block pb-1">
              {isRegister ? 'Inscripción técnica del edificio' : 'GESTIÓN DE INSPECCIONES Y CUMPLIMIENTO'}
            </p>
          </div>

          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-7">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <Mail size={12} className="text-blue-600" /> Correo Electrónico
                </label>
                {/* Se aumenta la altura/padding vertical del input para dar más sensación de "anchura" visual y comodidad */}
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="copropiedad@dominio.com" 
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300 shadow-sm" 
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-blue-600" /> Contraseña
                </label>
                <input 
                  type="password" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300 shadow-sm" 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    <span>Entrar a Panel</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nombre Copropiedad</label>
                  <input type="text" required value={regData.buildingName} onChange={(e) => setRegData({...regData, buildingName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">NIT</label>
                  <input type="text" required value={regData.nit} onChange={(e) => setRegData({...regData, nit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase">Dirección Física</label>
                <input type="text" required value={regData.address} onChange={(e) => setRegData({...regData, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-600 uppercase">Correo de Acceso</label>
                  <input type="email" required value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Contraseña</label>
                  <input type="password" required value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Registrar Copropiedad'}
              </button>
            </form>
          )}

          <div className="mt-10 text-center border-t border-slate-100 pt-8">
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-[11px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-[0.1em] flex items-center gap-2 mx-auto bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100"
            >
              {isRegister ? '¿Ya tiene cuenta? Inicie Sesión' : '¿No tiene cuenta? Registrar Edificio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
