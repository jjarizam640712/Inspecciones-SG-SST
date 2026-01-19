
import React, { useState } from 'react';
import { PlusCircle, Trash2, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import GeneralInfoSection from './GeneralInfoSection';
import PhotoUpload from './PhotoUpload';
import SignaturePad from './SignaturePad';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

const YES_NO_OPTIONS = ['Si', 'No'];
const YES_NO_CHANGE_OPTIONS = ['Si', 'No', 'Para cambio'];
const STATUS_OPTIONS = ['Buen Estado', 'Mal Estado', 'No se encuentra'];
const ACCEPTABLE_OPTIONS = ['Aceptable', 'No Aceptable'];

interface StretchersFormProps {
  initialData?: any;
  userProfile: UserProfile;
}

const StretchersForm: React.FC<StretchersFormProps> = ({ initialData, userProfile }) => {
  const [consecutive] = useState(initialData?.consecutive || `CAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [generalData, setGeneralData] = useState({ 
    date: initialData?.date || new Date().toISOString().split('T')[0], 
    buildingName: userProfile.buildingName, 
    nit: userProfile.nit, 
    address: userProfile.address, 
    legalRepresentative: userProfile.legalRepresentative, 
    inspectorName: userProfile.inspectorName, 
    email: userProfile.email 
  });

  const emptyItem = { 
    id: '1', 
    area: '', 
    location: '', 
    visible: '', 
    signaled: '', 
    access: '', 
    straps: '', 
    cervical_immobilizer: '', 
    limbs_immobilizer: '', 
    support_state: '', 
    material_state: '', 
    cervical_cleanliness: '', 
    limbs_cleanliness: '', 
    stretcher_cleanliness: '',
    obs: '', 
    photo1: null, 
    photo2: null 
  };

  const [items, setItems] = useState(initialData?.items || [{ ...emptyItem }]);
  const [signature, setSignature] = useState<string | null>(initialData?.signature_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addItem = () => setItems([...items, { ...emptyItem, id: Date.now().toString() }]);
  const updateItem = (id: string, field: string, value: any) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

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
        ? await supabase.from('stretchers').update(payload).eq('id', initialData.id)
        : await supabase.from('stretchers').insert([payload]);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert("¡Inspección de camillas registrada!");
    } catch (e) {
      alert("Error al guardar.");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="pb-12">
      <GeneralInfoSection data={generalData} onChange={(f, v) => setGeneralData({...generalData, [f]: v})} consecutive={consecutive} userProfile={userProfile} />
      
      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-600 pl-4">
          <h3 className="text-blue-900 font-black uppercase text-sm">Detalle Técnico de Camillas</h3>
        </div>

        {items.map((item, idx) => (
          <div key={item.id} className="p-6 bg-blue-50/20 rounded-2xl mb-10 border border-blue-100 relative">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md">{idx + 1}</div>
               <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Camilla - Registro #{idx + 1}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Área</label>
                <input type="text" value={item.area} onChange={(e) => updateItem(item.id, 'area', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: Piso 2" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Ubicación exacta</label>
                <input type="text" value={item.location} onChange={(e) => updateItem(item.id, 'location', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: Junto a enfermería" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">¿Visible?</label>
                <select value={item.visible} onChange={(e) => updateItem(item.id, 'visible', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">¿Señalizada?</label>
                <select value={item.signaled} onChange={(e) => updateItem(item.id, 'signaled', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_CHANGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">¿Fácil Acceso?</label>
                <select value={item.access} onChange={(e) => updateItem(item.id, 'access', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">¿Correas Seg.?</label>
                <select value={item.straps} onChange={(e) => updateItem(item.id, 'straps', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Inmov. Cervical</label>
                <select value={item.cervical_immobilizer} onChange={(e) => updateItem(item.id, 'cervical_immobilizer', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Inmov. Miembros</label>
                <select value={item.limbs_immobilizer} onChange={(e) => updateItem(item.id, 'limbs_immobilizer', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {YES_NO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Estado Soporte</label>
                <select value={item.support_state} onChange={(e) => updateItem(item.id, 'support_state', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Estado Polietileno</label>
                <select value={item.material_state} onChange={(e) => updateItem(item.id, 'material_state', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {ACCEPTABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Higiene Inmov. Cervical</label>
                <select value={item.cervical_cleanliness} onChange={(e) => updateItem(item.id, 'cervical_cleanliness', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {ACCEPTABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Higiene Inmov. Miembros</label>
                <select value={item.limbs_cleanliness} onChange={(e) => updateItem(item.id, 'limbs_cleanliness', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {ACCEPTABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block">Higiene de Camilla</label>
                <select value={item.stretcher_cleanliness} onChange={(e) => updateItem(item.id, 'stretcher_cleanliness', e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-[10px] font-bold">
                  <option value="">Seleccione...</option>
                  {ACCEPTABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Observaciones</label>
              <textarea value={item.obs} onChange={(e) => updateItem(item.id, 'obs', e.target.value)} className="w-full p-3 text-sm border border-blue-200 rounded-xl bg-white outline-none min-h-[80px]" placeholder="Detalles de hallazgos..."></textarea>
            </div>

            <PhotoUpload photo1={item.photo1} photo2={item.photo2} onChange1={(v) => updateItem(item.id, 'photo1', v)} onChange2={(v) => updateItem(item.id, 'photo2', v)} />
            
            {items.length > 1 && (
              <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute top-6 right-6 text-red-400 hover:text-red-600 transition-colors bg-red-50 p-2 rounded-full shadow-sm">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        <button onClick={addItem} className="w-full py-5 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 bg-white shadow-sm active:scale-[0.99]">
          <PlusCircle size={20} /> Agregar otra camilla
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
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : saveStatus === 'success' ? <><CheckCircle2 size={18} /> ¡Listo!</> : <><Save size={18} /> Registrar Camillas</>}
        </button>
      </div>
    </div>
  );
};

export default StretchersForm;
