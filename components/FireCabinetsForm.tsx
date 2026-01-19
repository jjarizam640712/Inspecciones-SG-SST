
import React, { useState } from 'react';
import { CABINET_STATES } from '../constants';
import { Save, PlusCircle, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import SignaturePad from './SignaturePad';
import GeneralInfoSection from './GeneralInfoSection';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface FireCabinetsFormProps {
  initialData?: any;
  userProfile: UserProfile;
}

const FireCabinetsForm: React.FC<FireCabinetsFormProps> = ({ initialData, userProfile }) => {
  const [consecutive] = useState(initialData?.consecutive || `GAB-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [generalData, setGeneralData] = useState({ 
    date: initialData?.date || new Date().toISOString().split('T')[0], 
    buildingName: userProfile.buildingName, 
    nit: userProfile.nit, 
    address: userProfile.address, 
    legalRepresentative: userProfile.legalRepresentative, 
    inspectorName: userProfile.inspectorName, 
    email: userProfile.email 
  });

  const [items, setItems] = useState(initialData?.items || [
    { id: '1', number: '', location: '', state: '', glass: '', axe: '', hose: '', nozzle: '', spanner: '', support: '', valve: '', obs: '', photo1: null, photo2: null }
  ]);
  
  const [signature, setSignature] = useState<string | null>(initialData?.signature_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addItem = () => setItems([...items, { id: Date.now().toString(), number: '', location: '', state: '', glass: '', axe: '', hose: '', nozzle: '', spanner: '', support: '', valve: '', obs: '', photo1: null, photo2: null }]);
  const updateItem = (id: string, field: string, value: any) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSubmit = async () => {
    if (!generalData.buildingName || !generalData.inspectorName) return alert("Complete los datos generales.");
    setIsSaving(true);
    try {
      const payload = {
        consecutive,
        client_code: userProfile.clientCode,
        date: generalData.date,
        building_name: generalData.buildingName,
        nit: generalData.nit,
        address: generalData.address,
        legal_representative: generalData.legalRepresentative,
        inspector_name: generalData.inspectorName,
        inspector_email: generalData.email,
        items,
        signature_url: signature
      };

      const { error } = initialData?.id 
        ? await supabase.from('fire_cabinets').update(payload).eq('id', initialData.id)
        : await supabase.from('fire_cabinets').insert([payload]);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert("¡Inspección de gabinetes guardada exitosamente!");
    } catch (e) {
      alert("Error al guardar.");
    } finally { setIsSaving(false); }
  };
  
  return (
    <div className="pb-12">
      <GeneralInfoSection data={generalData} onChange={(f, v) => setGeneralData({...generalData, [f]: v})} consecutive={consecutive} userProfile={userProfile} />

      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-600 pl-4">
          <h3 className="text-blue-900 font-black uppercase text-sm">Inspección Técnica de Gabinetes</h3>
        </div>
        
        {items.map((item, idx) => (
          <div key={item.id} className="p-6 bg-blue-50/20 rounded-2xl mb-8 border border-blue-100 relative">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md">{idx + 1}</div>
               <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Gabinete #{item.number || (idx + 1)}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">No. Gabinete</label>
                <input type="text" value={item.number} onChange={(e) => updateItem(item.id, 'number', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 01" />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Ubicación</label>
                <input type="text" value={item.location} onChange={(e) => updateItem(item.id, 'location', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ubicación exacta del gabinete" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Estado Gabinete', field: 'state' },
                { label: 'Vidrio', field: 'glass' },
                { label: 'Hacha', field: 'axe' },
                { label: 'Manguera', field: 'hose' },
                { label: 'Boquilla', field: 'nozzle' },
                { label: 'Llave Spanner', field: 'spanner' },
                { label: 'Soporte', field: 'support' },
                { label: 'Válvula', field: 'valve' }
              ].map((field) => (
                <div key={field.field}>
                  <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">{field.label}</label>
                  <select 
                    value={item[field.field as keyof typeof item] as string} 
                    onChange={(e) => updateItem(item.id, field.field, e.target.value)} 
                    className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e3a8a\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Seleccione...</option>
                    {CABINET_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Observaciones</label>
              <textarea value={item.obs} onChange={(e) => updateItem(item.id, 'obs', e.target.value)} className="w-full p-3 text-sm border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" placeholder="Detalles adicionales..."></textarea>
            </div>

            <PhotoUpload photo1={item.photo1} photo2={item.photo2} onChange1={(v) => updateItem(item.id, 'photo1', v)} onChange2={(v) => updateItem(item.id, 'photo2', v)} />
            
            {items.length > 1 && (
              <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors bg-red-50 p-2 rounded-full shadow-sm">
                <Trash2 size={16}/>
              </button>
            )}
          </div>
        ))}
        
        <button onClick={addItem} className="w-full py-5 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 bg-white shadow-sm active:scale-[0.99]">
          <PlusCircle size={18} /> Agregar otro gabinete
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm mb-8">
        <label className="block text-blue-900 font-black uppercase text-xs mb-4 border-l-4 border-blue-600 pl-3">Firma del Inspector Responsable</label>
        <SignaturePad onChange={setSignature} initialValue={signature} />
      </div>

      <div className="flex justify-end gap-4 px-4">
        <button 
          className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          onClick={() => { if(confirm("¿Seguro que desea cancelar? Se perderán los datos.")) window.location.reload() }}
        >
          <XCircle size={18} /> Cancelar
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={isSaving} 
          className={`px-12 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-600' : 'bg-[#1e3a8a] hover:bg-blue-900'} disabled:opacity-70`}
        >
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : saveStatus === 'success' ? <><CheckCircle2 size={18} /> ¡Listo!</> : <><Save size={18} /> Registrar Gabinetes</>}
        </button>
      </div>
    </div>
  );
};

export default FireCabinetsForm;
