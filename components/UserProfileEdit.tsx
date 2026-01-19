
import React, { useState } from 'react';
import { Save, User, Building2, MapPin, Mail, Phone, Globe, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface UserProfileEditProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>({...user});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      onUpdate(data);
      alert("Perfil actualizado correctamente. Los nuevos datos se aplicarán a sus futuras inspecciones.");
    } catch (err: any) {
      alert("Error al actualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Tarjeta de Suscripción */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10"><CreditCard size={120} /></div>
         <div className="relative z-10 flex flex-wrap justify-between items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Plan de Suscripción Actual</p>
              <h2 className="text-3xl font-black mb-2">{user.planType}</h2>
              <div className="flex items-center gap-4">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.subscriptionStatus === 'ACTIVO' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                   {user.subscriptionStatus}
                 </span>
                 <span className="text-blue-200 text-xs font-bold">Vence el: {user.expiryDate}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
               <p className="text-[9px] font-black uppercase text-blue-200 mb-1">Código de Cliente</p>
               <p className="text-xl font-black">{user.clientCode}</p>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-blue-100 shadow-xl">
        <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-600 pl-4">
          <User className="text-blue-600" />
          <h3 className="text-blue-900 font-black uppercase text-sm">Datos Operativos (Visibles en Reportes)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nombre Edificio</label>
            <input type="text" value={formData.buildingName} onChange={e => setFormData({...formData, buildingName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">NIT</label>
            <input type="text" value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dirección</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Representante Legal</label>
            <input type="text" value={formData.legalRepresentative} onChange={e => setFormData({...formData, legalRepresentative: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Inspector Principal</label>
            <input type="text" value={formData.inspectorName} onChange={e => setFormData({...formData, inspectorName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Correo Notificaciones</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-blue-100 shadow-xl">
        <div className="flex items-center gap-3 mb-8 border-l-4 border-slate-400 pl-4">
          <ShieldCheck className="text-slate-600" />
          <h3 className="text-slate-900 font-black uppercase text-sm">Datos Administrativos (Privados)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Correo Alternativo</label>
            <input type="email" value={formData.alternativeEmail} onChange={e => setFormData({...formData, alternativeEmail: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Celular de Contacto</label>
            <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
          </div>
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Ciudad</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Departamento</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">País</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar Cambios en Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileEdit;
