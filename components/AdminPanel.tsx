
import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Search, Calendar, Mail, Phone, MapPin, Loader2, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

const AdminPanel: React.FC = () => {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      setClients(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, planType: string) => {
    const daysToAdd = planType === 'MENSUAL' ? 30 : planType === 'TRIMESTRAL' ? 90 : 365;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + daysToAdd);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          expiryDate: newExpiry.toISOString().split('T')[0],
          subscriptionStatus: 'ACTIVO',
          planType
        })
        .eq('id', id);
      
      if (error) throw error;
      alert("Pago registrado y suscripción extendida.");
      fetchClients();
    } catch (err: any) {
      alert("Error al actualizar pago.");
    }
  };

  const filtered = clients.filter(c => 
    c.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-32 text-center"><Loader2 size={40} className="animate-spin mx-auto text-blue-900" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><Users size={24} /></div>
          <div><h4 className="text-[10px] font-black text-slate-400 uppercase">Total Edificios</h4><p className="text-2xl font-black text-blue-900">{clients.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600"><CheckCircle2 size={24} /></div>
          <div><h4 className="text-[10px] font-black text-slate-400 uppercase">Suscripciones Activas</h4><p className="text-2xl font-black text-emerald-900">{clients.filter(c => c.subscriptionStatus === 'ACTIVO').length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-2xl text-red-600"><XCircle size={24} /></div>
          <div><h4 className="text-[10px] font-black text-slate-400 uppercase">Vencidas / Inactivas</h4><p className="text-2xl font-black text-red-900">{clients.filter(c => c.subscriptionStatus !== 'ACTIVO').length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-blue-50 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <CreditCard className="text-blue-900" />
             <h3 className="font-black text-blue-900 uppercase text-sm tracking-tight">Gestión Maestra de Clientes</h3>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Edificio / Cliente</th>
                <th className="px-6 py-4">Estado Pago</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4">Datos Privados</th>
                <th className="px-6 py-4 text-center">Acciones de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-blue-600 text-xs">{client.clientCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{client.buildingName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">NIT: {client.nit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      client.subscriptionStatus === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {client.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                      <Calendar size={12} /> {client.expiryDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] flex items-center gap-1.5 font-bold text-slate-500"><Phone size={10}/> {client.mobile}</span>
                       <span className="text-[9px] flex items-center gap-1.5 font-bold text-slate-500"><Mail size={10}/> {client.alternativeEmail || client.email}</span>
                       <span className="text-[9px] flex items-center gap-1.5 font-bold text-slate-500"><MapPin size={10}/> {client.city}, {client.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => updateSubscription(client.id, 'MENSUAL')} className="px-2 py-1 bg-blue-600 text-white rounded text-[8px] font-black uppercase hover:bg-blue-700">Mes</button>
                      <button onClick={() => updateSubscription(client.id, 'TRIMESTRAL')} className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-black uppercase hover:bg-indigo-700">Trim</button>
                      <button onClick={() => updateSubscription(client.id, 'ANUAL')} className="px-2 py-1 bg-slate-900 text-white rounded text-[8px] font-black uppercase hover:bg-black">Año</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
