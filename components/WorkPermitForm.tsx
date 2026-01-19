
import React, { useState } from 'react';
import { Save, Trash2, UserPlus, Loader2, CheckCircle2, XCircle, FileText, HardHat, Clock, MapPin, AlertTriangle, FileUp, UserCheck, ShieldCheck } from 'lucide-react';
import GeneralInfoSection from './GeneralInfoSection';
import SignaturePad from './SignaturePad';
import { supabase } from '../services/supabaseClient';

const YES_NO_OPTIONS = ['Si', 'No'];
const PERMIT_TYPES = ['Alturas', 'Caliente', 'Espacios Confinados', 'Eléctrico', 'Excavaciones', 'Izaje de Cargas', 'Otros'];

interface WorkPermitFormProps {
  initialData?: any;
}

const WorkPermitForm: React.FC<WorkPermitFormProps> = ({ initialData }) => {
  const [consecutive] = useState(initialData?.consecutive || `WP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  
  const [generalData, setGeneralData] = useState({ 
    date: initialData?.date || new Date().toISOString().split('T')[0], 
    buildingName: initialData?.building_name || '', 
    nit: initialData?.nit || '', 
    address: initialData?.address || '', 
    legalRepresentative: initialData?.legal_representative || '',
    inspectorName: initialData?.inspector_name || '', 
    email: initialData?.inspector_email || '' 
  });

  const [workDetails, setWorkDetails] = useState({
    contractor_company: initialData?.contractor_company || '',
    responsible_person: initialData?.responsible_person || '',
    work_date: initialData?.work_date || new Date().toISOString().split('T')[0],
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    area_process: initialData?.area_process || initialData?.area || '', // Fallback a 'area' si 'area_process' falla
    work_location: initialData?.work_location || initialData?.location || '',
    required_permit: initialData?.required_permit || '',
    worker_count: initialData?.worker_count || 0,
    activity_description: initialData?.activity_description || '',
    tasks_description: initialData?.tasks_description || '',
    equipment_description: initialData?.equipment_description || '',
    materials_description: initialData?.materials_description || '',
    risk_analysis: initialData?.risk_analysis || '',
    incident_probable: initialData?.incident_probable || '',
    incident_probable_with_controls: initialData?.incident_probable_with_controls || '',
    ats_pdf: initialData?.ats_pdf || null,
    schedule_pdf: initialData?.schedule_pdf || null,
    sst_responsible_name: initialData?.sst_responsible_name || '',
    sst_responsible_hv_pdf: initialData?.sst_responsible_hv_pdf || null,
    company_responsible_name: initialData?.company_responsible_name || '',
    company_responsible_cc: initialData?.company_responsible_cc || '',
    company_signature: initialData?.company_signature || null
  });
  
  const [workers, setWorkers] = useState(initialData?.workers || [
    { id: '1', name: '', cc: '', arl: '', eps: '', profession: '', activity: '', equipment: '', supports_pdf: null, cv_pdf: null }
  ]);

  const [inspectorSignature, setInspectorSignature] = useState<string | null>(initialData?.signature_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addWorker = () => setWorkers([...workers, { 
    id: Date.now().toString(), name: '', cc: '', arl: '', eps: '', profession: '', activity: '', equipment: '', supports_pdf: null, cv_pdf: null 
  }]);

  const updateWorker = (id: string, field: string, value: any) => 
    setWorkers(workers.map(w => w.id === id ? { ...w, [field]: value } : w));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Por favor, seleccione un archivo PDF válido.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!generalData.buildingName || !generalData.inspectorName) return alert("Complete Edificio e Inspector.");
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Mapeo seguro de campos para evitar errores de columnas inexistentes
      const payload: any = {
        consecutive,
        date: generalData.date,
        building_name: generalData.buildingName,
        nit: generalData.nit,
        address: generalData.address,
        inspector_name: generalData.inspectorName,
        inspector_email: generalData.email,
        contractor_company: workDetails.contractor_company,
        responsible_person: workDetails.responsible_person,
        work_date: workDetails.work_date,
        start_time: workDetails.start_time,
        end_time: workDetails.end_time,
        // Usamos 'area' en lugar de 'area_process' si la base de datos no tiene esa columna
        area: workDetails.area_process, 
        location: workDetails.work_location,
        required_permit: workDetails.required_permit,
        worker_count: workDetails.worker_count,
        activity_description: workDetails.activity_description,
        ats_pdf: workDetails.ats_pdf,
        schedule_pdf: workDetails.schedule_pdf,
        sst_responsible_name: workDetails.sst_responsible_name,
        sst_responsible_hv_pdf: workDetails.sst_responsible_hv_pdf,
        company_responsible_name: workDetails.company_responsible_name,
        company_responsible_cc: workDetails.company_responsible_cc,
        company_signature: workDetails.company_signature,
        workers,
        signature_url: inspectorSignature,
      };

      const { error } = initialData?.id 
        ? await supabase.from('work_permits').update(payload).eq('id', initialData.id)
        : await supabase.from('work_permits').insert([payload]);

      if (error) throw error;
      
      setSaveStatus('success');
      alert("¡Permiso de Trabajo guardado con éxito!");
    } catch (e: any) {
      console.error("Error detallado:", e);
      alert(`Error de base de datos: ${e.message}. Verifique que las columnas coincidan con el esquema.`);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="pb-12 space-y-8">
      <GeneralInfoSection data={generalData} onChange={(f, v) => setGeneralData({...generalData, [f]: v})} consecutive={consecutive} />
      
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-l-4 border-blue-600 pl-4">
          <Clock className="text-blue-600" size={20} />
          <h3 className="text-blue-900 font-black uppercase text-sm">Logística y Ubicación</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-800 uppercase">Empresa Contratista</label>
            <input type="text" value={workDetails.contractor_company} onChange={(e) => setWorkDetails({...workDetails, contractor_company: e.target.value})} className="w-full p-2.5 border border-blue-100 rounded-xl bg-blue-50/20 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-800 uppercase">Responsable del Trabajo</label>
            <input type="text" value={workDetails.responsible_person} onChange={(e) => setWorkDetails({...workDetails, responsible_person: e.target.value})} className="w-full p-2.5 border border-blue-100 rounded-xl bg-blue-50/20 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-800 uppercase">Área / Proceso</label>
            <input type="text" value={workDetails.area_process} onChange={(e) => setWorkDetails({...workDetails, area_process: e.target.value})} className="w-full p-2.5 border border-blue-100 rounded-xl bg-blue-50/20 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-blue-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
            <HardHat className="text-emerald-600" size={20} />
            <h3 className="text-blue-900 font-black uppercase text-sm">Personal Autorizado</h3>
          </div>
          <button onClick={addWorker} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-emerald-700 transition-colors">
            <UserPlus size={14} /> Agregar Trabajador
          </button>
        </div>
        
        <div className="space-y-6">
          {workers.map((worker) => (
            <div key={worker.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Nombre y Apellido</label>
                  <input type="text" value={worker.name} onChange={(e) => updateWorker(worker.id, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">C.C.</label>
                  <input type="text" value={worker.cc} onChange={(e) => updateWorker(worker.id, 'cc', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">ARL</label>
                  <input type="text" value={worker.arl} onChange={(e) => updateWorker(worker.id, 'arl', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">EPS</label>
                  <input type="text" value={worker.eps} onChange={(e) => updateWorker(worker.id, 'eps', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp size={16} className={worker.supports_pdf ? "text-emerald-500" : "text-blue-500"} />
                    <span className="text-[10px] font-black text-slate-600 uppercase">
                      {worker.supports_pdf ? "✓ SOPORTES CARGADOS" : "SOPORTES TRABAJADOR (PDF)"}
                    </span>
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (b) => updateWorker(worker.id, 'supports_pdf', b))} className="text-[10px] w-32 cursor-pointer" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp size={16} className={worker.cv_pdf ? "text-emerald-500" : "text-blue-500"} />
                    <span className="text-[10px] font-black text-slate-600 uppercase">
                      {worker.cv_pdf ? "✓ HV CARGADA" : "HOJA DE VIDA (PDF)"}
                    </span>
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (b) => updateWorker(worker.id, 'cv_pdf', b))} className="text-[10px] w-32 cursor-pointer" />
                </div>
              </div>

              {workers.length > 1 && (
                <button onClick={() => setWorkers(workers.filter(w => w.id !== worker.id))} className="absolute -top-2 -right-2 text-white bg-red-500 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-l-4 border-blue-600 pl-4">
          <ShieldCheck className="text-blue-600" size={20} />
          <h3 className="text-blue-900 font-black uppercase text-sm">Documentación y Responsables</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className={`text-[10px] font-black uppercase block mb-1 ${workDetails.ats_pdf ? "text-emerald-600" : "text-blue-800"}`}>
                {workDetails.ats_pdf ? "✓ ATS CARGADO (PDF)" : "ATS CONTRATISTA (PDF)"}
              </span>
            </div>
            <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (b) => setWorkDetails({...workDetails, ats_pdf: b}))} className="text-[10px] cursor-pointer" />
          </div>
          <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className={`text-[10px] font-black uppercase block mb-1 ${workDetails.schedule_pdf ? "text-emerald-600" : "text-blue-800"}`}>
                {workDetails.schedule_pdf ? "✓ CRONOGRAMA CARGADO" : "CRONOGRAMA (PDF)"}
              </span>
            </div>
            <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (b) => setWorkDetails({...workDetails, schedule_pdf: b}))} className="text-[10px] cursor-pointer" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-blue-900 uppercase border-b border-blue-100 pb-2">Responsable SG-SST</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Nombre Responsable SST" value={workDetails.sst_responsible_name} onChange={(e) => setWorkDetails({...workDetails, sst_responsible_name: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className={`text-[10px] font-black uppercase ${workDetails.sst_responsible_hv_pdf ? "text-emerald-600" : "text-slate-500"}`}>
                    {workDetails.sst_responsible_hv_pdf ? "✓ HV CARGADA" : "HOJA DE VIDA (PDF)"}
                  </span>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (b) => setWorkDetails({...workDetails, sst_responsible_hv_pdf: b}))} className="text-[10px] w-32 cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-blue-900 uppercase border-b border-blue-100 pb-2">Responsable de la Empresa</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Nombre Responsable Empresa" value={workDetails.company_responsible_name} onChange={(e) => setWorkDetails({...workDetails, company_responsible_name: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
                <input type="text" placeholder="Cédula" value={workDetails.company_responsible_cc} onChange={(e) => setWorkDetails({...workDetails, company_responsible_cc: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
          <label className="block text-blue-900 font-black uppercase text-[10px] mb-4 border-l-4 border-blue-600 pl-3">Firma Responsable Empresa</label>
          <SignaturePad onChange={(b) => setWorkDetails({...workDetails, company_signature: b})} initialValue={workDetails.company_signature} />
        </div>
        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
          <label className="block text-blue-900 font-black uppercase text-[10px] mb-4 border-l-4 border-emerald-600 pl-3">Firma SST / Inspector Autorizador</label>
          <SignaturePad onChange={setInspectorSignature} initialValue={inspectorSignature} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4 px-4">
        <button 
          className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          onClick={() => { if(confirm("¿Seguro que desea cancelar?")) window.location.reload() }}
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={isSaving} 
          className={`px-12 py-4 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50 transition-all ${
            saveStatus === 'success' ? 'bg-emerald-600' : 'bg-[#1e3a8a] hover:bg-blue-900'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : saveStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaving ? 'Guardando...' : saveStatus === 'success' ? '¡Permiso Registrado!' : 'Emitir Permiso de Trabajo'}
        </button>
      </div>
    </div>
  );
};

export default WorkPermitForm;
