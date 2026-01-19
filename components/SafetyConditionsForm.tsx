
import React, { useState } from 'react';
import { PlusCircle, Trash2, Sparkles, Loader2, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import GeneralInfoSection from './GeneralInfoSection';
import PhotoUpload from './PhotoUpload';
import SignaturePad from './SignaturePad';
import { analyzeSafetyCondition } from '../services/geminiService';
import { DANGER_OPTIONS, RISK_LEVEL_OPTIONS } from '../constants';
import { UserProfile } from '../types';

interface SafetyConditionsFormProps {
  initialData?: any;
  userProfile: UserProfile;
}

const SafetyConditionsForm: React.FC<SafetyConditionsFormProps> = ({ initialData, userProfile }) => {
  const [consecutive] = useState(initialData?.consecutive || `INS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  
  const [generalData, setGeneralData] = useState({ 
    date: initialData?.date || new Date().toISOString().split('T')[0], 
    buildingName: userProfile.buildingName, 
    nit: userProfile.nit, 
    address: userProfile.address, 
    legalRepresentative: userProfile.legalRepresentative, 
    inspectorName: userProfile.inspectorName, 
    email: userProfile.email 
  });
  
  const [findings, setFindings] = useState<any[]>(initialData?.findings || [
    { id: '1', area: '', dangerType: '', description: '', actionType: '', actionImplementation: '', responsiblePerson: '', riskLevel: '', photo1: null, photo2: null }
  ]);
  
  const [signature, setSignature] = useState<string | null>(initialData?.signature_url || null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addFinding = () => setFindings([...findings, { 
    id: Date.now().toString(), area: '', dangerType: '', description: '', actionType: '', actionImplementation: '', responsiblePerson: '', riskLevel: '', photo1: null, photo2: null 
  }]);

  const updateFinding = (id: string, field: string, value: any) => 
    setFindings(findings.map(f => f.id === id ? { ...f, [field]: value } : f));

  const handleAiAnalyze = async (id: string) => {
    const finding = findings.find(f => f.id === id);
    if (!finding?.description) return alert("Por favor, describa la condición antes de usar la IA.");
    
    setIsAnalyzing(id);
    try {
      const result = await analyzeSafetyCondition(finding.description, finding.photo1);
      setFindings(findings.map(f => f.id === id ? { 
        ...f, 
        dangerType: result.dangerType, 
        actionType: result.actionType, 
        actionImplementation: result.actionImplementation,
        riskLevel: result.riskLevel
      } : f));
    } catch (e) {
      console.error(e);
      alert("Error con la IA. Complete los campos manualmente.");
    } finally { setIsAnalyzing(null); }
  };

  const handleSubmit = async () => {
    if (userProfile.subscriptionStatus !== 'ACTIVO') {
      alert("Su suscripción ha vencido. Por favor contacte a soporte.");
      return;
    }

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
        findings,
        signature_url: signature 
      };

      const { error } = await supabase.from('safety_inspections').insert([payload]);
      if (error) throw error;
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert("Inspección guardada con éxito.");
    } catch (error: any) {
      setSaveStatus('error');
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-16 max-w-5xl mx-auto">
      <GeneralInfoSection 
        data={generalData} 
        onChange={(f, v) => setGeneralData({...generalData, [f]: v})} 
        consecutive={consecutive}
        userProfile={userProfile}
      />
      
      <div className="space-y-8 mt-8">
        {findings.map((finding, idx) => (
          <div key={finding.id} className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-blue-900 font-black uppercase text-sm tracking-tight">Condición de Seguridad</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Hallazgo de Campo</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleAiAnalyze(finding.id)} 
                disabled={isAnalyzing !== null}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {isAnalyzing === finding.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analizar con IA
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1.5 block ml-1">Área / Ubicación</label>
                <input 
                  type="text" 
                  value={finding.area} 
                  onChange={(e) => updateFinding(finding.id, 'area', e.target.value)} 
                  className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1.5 block ml-1">Nivel de Riesgo</label>
                <select 
                  value={finding.riskLevel} 
                  onChange={(e) => updateFinding(finding.id, 'riskLevel', e.target.value)} 
                  className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-xs"
                >
                  <option value="">Seleccione...</option>
                  {RISK_LEVEL_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black text-blue-800 uppercase mb-1.5 block ml-1">Descripción de la Condición</label>
              <textarea 
                rows={3} 
                value={finding.description} 
                onChange={(e) => updateFinding(finding.id, 'description', e.target.value)} 
                className="w-full p-4 bg-blue-50/20 border border-blue-100 rounded-[1.5rem] text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1.5 block ml-1">Tipo de Peligro</label>
                <select 
                  value={finding.dangerType} 
                  onChange={(e) => updateFinding(finding.id, 'dangerType', e.target.value)} 
                  className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-2xl font-bold text-xs"
                >
                  <option value="">Seleccione...</option>
                  {DANGER_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-800 uppercase mb-1.5 block ml-1">Plan de Acción / Medida</label>
                <textarea 
                  rows={2} 
                  value={finding.actionImplementation} 
                  onChange={(e) => updateFinding(finding.id, 'actionImplementation', e.target.value)} 
                  className="w-full p-3 bg-blue-50/20 border border-blue-100 rounded-2xl text-sm" 
                />
              </div>
            </div>

            <PhotoUpload 
              photo1={finding.photo1} 
              photo2={finding.photo2} 
              onChange1={(v) => updateFinding(finding.id, 'photo1', v)} 
              onChange2={(v) => updateFinding(finding.id, 'photo2', v)} 
            />
            
            {findings.length > 1 && (
              <button 
                onClick={() => setFindings(findings.filter(f => f.id !== finding.id))} 
                className="absolute top-8 right-8 text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={addFinding} 
        className="w-full py-8 mt-8 border-4 border-dashed border-blue-100 rounded-[2.5rem] text-blue-500 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 bg-white group"
      >
        <PlusCircle size={24} /> 
        Añadir nuevo hallazgo
      </button>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="text-blue-600" size={20} />
          <h3 className="text-blue-900 font-black uppercase text-sm tracking-tight">Firma del Inspector</h3>
        </div>
        <SignaturePad onChange={(base64) => setSignature(base64)} initialValue={signature} />
      </div>

      <div className="mt-10 flex flex-wrap justify-end gap-4 px-4">
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className={`px-12 py-4 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all transform active:scale-95 flex items-center gap-3 ${
            saveStatus === 'success' ? 'bg-emerald-600' : 'bg-[#1e3a8a] hover:bg-blue-900'
          } disabled:opacity-70`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaving ? 'Guardando...' : saveStatus === 'success' ? '¡Éxito!' : 'Finalizar Inspección'}
        </button>
      </div>
    </div>
  );
};

export default SafetyConditionsForm;
