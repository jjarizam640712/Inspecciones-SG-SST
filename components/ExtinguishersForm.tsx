
import React, { useState } from 'react';
import { PlusCircle, Trash2, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import GeneralInfoSection from './GeneralInfoSection';
import PhotoUpload from './PhotoUpload';
import SignaturePad from './SignaturePad';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

const CHECK_OPTIONS = ['Buen Estado', 'Mal Estado', 'No Aplica', 'No se encontró'];

interface ExtinguishersFormProps {
  initialData?: any;
  userProfile: UserProfile;
}

const ExtinguishersForm: React.FC<ExtinguishersFormProps> = ({ initialData, userProfile }) => {
  const [consecutive] = useState(initialData?.consecutive || `EXT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
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
    id: '1', area: '', position: '', id_ext: '', capacity: '', agent_type: '', class_ext: '', 
    last_recharge: '', next_recharge: '', 
    signage: '', labels: '', chemical_label: '', seal: '', paint: '', 
    visibility: '', corrosion: '', manometer: '', agent_state: '', 
    pressure: '', pin: '', valve: '', trigger: '', 
    handle: '', hose: '', nozzle: '', cylinder: '', siphon: '',
    obs: '', photo1: null, photo2: null 
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
        ? await supabase.from('extinguishers').update(payload).eq('id', initialData.id)
        : await supabase.from('extinguishers').insert([payload]);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert("¡Inspección de extintores guardada exitosamente!");
    } catch (e) {
      alert("Error al guardar en base de datos.");
    } finally { setIsSaving(false); }
  };

  const technicalChecks = [
    { label: 'Señalización de Seguridad', field: 'signage' },
    { label: 'Etiquetas', field: 'labels' },
    { label: 'Etiqueta Sust. Química', field: 'chemical_label' },
    { label: 'Sello de Seguridad', field: 'seal' },
    { label: 'Pintura', field: 'paint' },
    { label: 'Acceso / Visibilidad', field: 'visibility' },
    { label: 'Corrosión', field: 'corrosion' },
    { label: 'Manómetro', field: 'manometer' },
    { label: 'Estado Agente Extintor', field: 'agent_state' },
    { label: 'Presión', field: 'pressure' },
    { label: 'Pin o Seguro', field: 'pin' },
    { label: 'Válvula', field: 'valve' },
    { label: 'Palanca de Descarga', field: 'trigger' },
    { label: 'Manija de Traslado', field: 'handle' },
    { label: 'Manguera', field: 'hose' },
    { label: 'Boquilla / Cono', field: 'nozzle' },
    { label: 'Cilindro / Recipiente', field: 'cylinder' },
    { label: 'Tubo Sifón', field: 'siphon' }
  ];

  return (
    <div className="pb-12">
      <GeneralInfoSection data={generalData} onChange={(f, v) => setGeneralData({...generalData, [f]: v})} consecutive={consecutive} userProfile={userProfile} />
      
      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-600 pl-4">
          <h3 className="text-blue-900 font-black uppercase text-sm">Detalle Técnico de Extintores</h3>
        </div>

        {items.map((item, idx) => (
          <div key={item.id} className="p-6 bg-blue-50/20 rounded-2xl mb-10 border border-blue-100 relative">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md">{idx + 1}</div>
               <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Extintor #{item.id_ext || (idx + 1)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Área / Ubicación</label>
                <input type="text" value={item.area} onChange={(e) => updateItem(item.id, 'area', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: Pasillo principal" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Posición</label>
                <input type="text" value={item.position} onChange={(e) => updateItem(item.id, 'position', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: Nivel 1" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Identificación</label>
                <input type="text" value={item.id_ext} onChange={(e) => updateItem(item.id, 'id_ext', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: EXT-001" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Capacidad</label>
                <input type="text" value={item.capacity} onChange={(e) => updateItem(item.id, 'capacity', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: 10 lbs" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Agente</label>
                <input type="text" value={item.agent_type} onChange={(e) => updateItem(item.id, 'agent_type', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" placeholder="Ej: Multipropósito ABC" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Fecha Últ. Recarga</label>
                <input type="date" value={item.last_recharge} onChange={(e) => updateItem(item.id, 'last_recharge', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Fecha Próx. Recarga</label>
                <input type="date" value={item.next_recharge} onChange={(e) => updateItem(item.id, 'next_recharge', e.target.value)} className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {technicalChecks.map((check) => (
                <div key={check.field}>
                  <label className="text-[9px] font-black text-blue-700 uppercase mb-1 block truncate leading-tight">{check.label}</label>
                  <select 
                    value={item[check.field as keyof typeof item] as string} 
                    onChange={(e) => updateItem(item.id, check.field, e.target.value)} 
                    className="w-full p-2 border border-blue-200 rounded-lg bg-white text-[10px] font-bold outline-none appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e3a8a\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.4rem center', backgroundSize: '0.8em' }}
                  >
                    <option value="">Seleccione...</option>
                    {CHECK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black text-blue-800 uppercase mb-1 block">Observaciones Específicas</label>
              <textarea value={item.obs} onChange={(e) => updateItem(item.id, 'obs', e.target.value)} className="w-full p-3 text-sm border border-blue-200 rounded-xl bg-white outline-none min-h-[80px]" placeholder="Detalles de hallazgos para este extintor..."></textarea>
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
          <PlusCircle size={20} /> Agregar otro extintor
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
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : saveStatus === 'success' ? <><CheckCircle2 size={18} /> ¡Listo!</> : <><Save size={18} /> Registrar Extintores</>}
        </button>
      </div>
    </div>
  );
};

export default ExtinguishersForm;
