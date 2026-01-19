
import React from 'react';
import { UserProfile } from '../types';

interface GeneralInfoSectionProps {
  data: any;
  onChange: (field: string, value: string) => void;
  consecutive: string;
  userProfile?: UserProfile;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ data, onChange, consecutive, userProfile }) => {
  return (
    <section className="bg-white rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-900/5 overflow-hidden mb-8">
      <div className="p-8 lg:p-10">
        <div className="flex justify-between items-center mb-8">
           <div className="border-l-4 border-blue-600 pl-4">
             <h2 className="text-blue-900 font-black uppercase tracking-tight text-sm">Información General del Servicio</h2>
             <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Datos vinculados a su cuenta corporativa</p>
           </div>
           <div className="flex flex-col items-end gap-1">
             <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100">
               ID: {consecutive}
             </div>
             {userProfile && (
               <span className="text-[8px] font-black text-blue-400 uppercase pr-2">CÓDIGO: {userProfile.clientCode}</span>
             )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-blue-900 uppercase ml-1">Fecha de Inspección</label>
            <input 
              type="date" 
              value={data.date} 
              onChange={(e) => onChange('date', e.target.value)} 
              className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-blue-900 uppercase ml-1">Edificio / Conjunto</label>
            <input 
              type="text" 
              readOnly={!!userProfile}
              value={data.buildingName} 
              className="w-full p-4 border rounded-2xl outline-none bg-blue-50/30 border-blue-100 text-blue-900 text-sm font-black" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-blue-900 uppercase ml-1">NIT</label>
            <input 
              type="text" 
              readOnly={!!userProfile}
              value={data.nit} 
              className="w-full p-4 border rounded-2xl outline-none bg-blue-50/30 border-blue-100 text-blue-900 text-sm font-black" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-blue-900 uppercase ml-1">Inspector Responsable</label>
            <input 
              type="text" 
              readOnly={!!userProfile}
              value={data.inspectorName} 
              className="w-full p-4 border rounded-2xl outline-none bg-blue-50/30 border-blue-100 text-blue-900 text-sm font-black" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralInfoSection;

