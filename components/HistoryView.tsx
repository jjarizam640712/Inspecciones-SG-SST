
import React, { useEffect, useState } from 'react';
import { 
  Search, Loader2, Flame, Shield, 
  LifeBuoy, BriefcaseMedical, Navigation, MapPin, 
  ChevronDown, Download, Edit3, Calendar, FileText,
  AlertTriangle, ShieldCheck, Hash, Building2, FileSearch,
  Mail, User, Map, CreditCard, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// Declaración para TypeScript de las librerías globales
declare const jspdf: any;

interface HistoryViewProps {
  onEdit: (inspection: any, moduleType: string) => void;
  filter?: string;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onEdit, filter }) => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const moduleConfig: Record<string, { table: string, label: string, icon: any }> = {
    'SAFETY_CONDITIONS': { table: 'safety_inspections', label: 'SEGURIDAD', icon: AlertTriangle },
    'FIRE_CABINETS': { table: 'fire_cabinets', label: 'GABINETES', icon: Flame },
    'EXTINGUISHERS': { table: 'extinguishers', label: 'EXTINTORES', icon: Shield },
    'STRETCHERS': { table: 'stretchers', label: 'CAMILLAS', icon: LifeBuoy },
    'FIRST_AID_KITS': { table: 'first_aid_kits', label: 'BOTIQUÍN', icon: BriefcaseMedical },
    'SIGNAGE': { table: 'signage', label: 'SEÑALIZACIÓN', icon: Navigation },
  };

  useEffect(() => {
    fetchAllData();
  }, [filter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      let allResults: any[] = [];
      const modulesToFetch = filter ? [filter] : Object.keys(moduleConfig);

      for (const mod of modulesToFetch) {
        const config = moduleConfig[mod];
        if (!config) continue;
        
        const { data, error } = await supabase
          .from(config.table)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          allResults = [...allResults, ...data.map(item => ({ 
            ...item, 
            _module: mod,
            display_name: item.building_name || item.establishment_name || 'Sin Nombre',
            display_date: item.date || item.created_at?.split('T')[0]
          }))];
        }
      }
      setInspections(allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      console.error("Error cargando historial:", e);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (ins: any) => {
    setIsExporting(ins.id);
    try {
      const { jsPDF } = jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const primaryColor = [30, 58, 138];
      const accentColor = [59, 130, 246];

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE TÉCNICO DE INSPECCIÓN", 15, 18);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)`, 15, 26);
      doc.text(`MODULO: ${moduleConfig[ins._module]?.label || 'INSPECCIÓN'}`, 15, 32);

      doc.setFontSize(12);
      doc.text(ins.consecutive || 'N/A', pageWidth - 15, 25, { align: 'right' });

      doc.autoTable({
        startY: 45,
        head: [[{ content: 'INFORMACIÓN GENERAL DEL REGISTRO', colSpan: 2, styles: { halign: 'center', fillColor: accentColor } }]],
        body: [
          ['Consecutivo:', ins.consecutive || 'N/A'],
          ['Fecha:', ins.display_date || 'N/A'],
          ['Edificio / Conjunto:', ins.display_name || 'N/A'],
          ['NIT:', ins.nit || 'N/A'],
          ['Dirección:', ins.address || 'N/A'],
          ['Representante Legal:', ins.legal_representative || 'N/A'],
          ['Inspector:', ins.inspector_name || 'N/A'],
          ['Correo:', ins.inspector_email || 'N/A'],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fontStyle: 'bold' }
      });

      const items = ins.items || ins.findings || [];
      const tableData = items.map((item: any, idx: number) => {
        if (ins._module === 'SIGNAGE') {
          return [idx + 1, item.area || 'N/A', item.location || 'N/A', item.signalType || 'N/A', item.quantity || '0', item.state || 'N/A', item.obs || 'Sin novedades'];
        } else if (ins._module === 'FIRST_AID_KITS' || ins._module === 'STRETCHERS' || ins._module === 'FIRE_CABINETS') {
          return [idx + 1, item.area || item.location || item.number || 'N/A', 'Revisión técnica realizada', item.obs || 'Sin novedades'];
        } else if (ins._module === 'EXTINGUISHERS') {
          return [idx + 1, item.area || 'N/A', item.id_ext || 'N/A', item.agent_type || 'N/A', item.next_recharge || 'N/A', item.obs || 'Sin novedades'];
        } else {
          return [idx + 1, item.area || item.location || 'N/A', item.dangerType || 'N/A', item.riskLevel || 'N/A', item.actionType || 'N/A'];
        }
      });

      const tableHead = (ins._module === 'SIGNAGE') ? [['#', 'Área', 'Ubicación', 'Tipo', 'Cant.', 'Estado', 'Observaciones']] : [['#', 'Ubicación / Área', 'Estado / Detalle', 'Observaciones']];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: tableHead,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, fontSize: 8 },
        styles: { fontSize: 8 }
      });

      let currentY = doc.lastAutoTable.finalY + 15;
      const hasPhotos = items.some((it: any) => it.photo1 || it.photo2);
      
      if (hasPhotos) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.text("EVIDENCIA FOTOGRÁFICA DE HALLAZGOS", 15, currentY);
        currentY += 10;
        for (const item of items) {
          if (item.photo1) {
            try {
              doc.addImage(item.photo1, 'JPEG', 15, currentY, 40, 40);
              if (item.photo2) doc.addImage(item.photo2, 'JPEG', 60, currentY, 40, 40);
              currentY += 45;
              if (currentY > 240) { doc.addPage(); currentY = 20; }
            } catch (err) { console.error("Error al añadir imagen", err); }
          }
        }
      }

      if (currentY > 240) { doc.addPage(); currentY = 20; }
      currentY += 10;
      doc.setDrawColor(200);
      doc.line(15, currentY + 25, 80, currentY + 25);
      if (ins.signature_url) {
        try { doc.addImage(ins.signature_url, 'JPEG', 15, currentY, 60, 25); } catch (e) {}
      }
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("FIRMA DEL INSPECTOR RESPONSABLE", 15, currentY + 30);
      doc.text(ins.inspector_name || 'Validado Digitalmente', 15, currentY + 34);
      doc.save(`Inspeccion_${ins.consecutive || 'SG-SST'}.pdf`);
    } catch (error) {
      console.error("Fallo PDF:", error);
      alert("No se pudo generar el archivo.");
    } finally {
      setIsExporting(null);
    }
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const renderBadge = (label: string, value: any) => {
    const isBad = ['Mal Estado', 'Malo', 'No', 'No Aceptable', 'Surtir Elemento', 'Para cambio', 'Crítico', 'Alto', 'No se encuentra'].includes(String(value));
    return (
      <div className="flex flex-col p-2 bg-slate-50 border border-slate-100 rounded-lg h-full">
        <span className="text-[7px] font-black text-slate-400 uppercase mb-1">{label}</span>
        <span className={`text-[9px] font-bold uppercase truncate ${isBad ? 'text-red-600' : 'text-emerald-700'}`}>
          {value !== undefined && value !== null ? String(value) : 'N/A'}
        </span>
      </div>
    );
  };

  const renderInfoGeneralHead = (ins: any) => (
    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8">
      <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-600 pl-3">
        <h3 className="text-blue-900 font-black uppercase text-[10px] tracking-widest">Información General del Registro</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><Hash size={10}/> Consecutivo No.</span><span className="text-[11px] font-bold text-slate-800">{ins.consecutive}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><Calendar size={10}/> Fecha de Inspección</span><span className="text-[11px] font-bold text-slate-800">{ins.display_date}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><Building2 size={10}/> Edificio / Conjunto</span><span className="text-[11px] font-bold text-slate-800">{ins.display_name}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><CreditCard size={10}/> NIT</span><span className="text-[11px] font-bold text-slate-800">{ins.nit || 'N/A'}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><Map size={10}/> Dirección</span><span className="text-[11px] font-bold text-slate-800">{ins.address || 'N/A'}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><User size={10}/> Representante Legal</span><span className="text-[11px] font-bold text-slate-800">{ins.legal_representative || 'N/A'}</span></div>
        <div className="flex flex-col"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><ShieldCheck size={10}/> Inspector</span><span className="text-[11px] font-bold text-slate-800">{ins.inspector_name}</span></div>
        <div className="flex flex-col md:col-span-2 lg:col-span-1"><span className="text-[8px] font-black text-blue-800 uppercase flex items-center gap-1.5"><Mail size={10}/> Correo Electrónico</span><span className="text-[11px] font-bold text-slate-800 truncate">{ins.inspector_email || 'N/A'}</span></div>
      </div>
    </div>
  );

  const renderExtinguisherItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Extintor #{item.id_ext || i+1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {renderBadge('Area', item.area)}{renderBadge('Posición', item.position)}{renderBadge('Identificación', item.id_ext)}{renderBadge('Capacidad', item.capacity)}{renderBadge('Agente', item.agent_type)}{renderBadge('Clase', item.class_ext)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-50">
          {renderBadge('Última Recarga', item.last_recharge)}{renderBadge('Próxima Recarga', item.next_recharge)}{renderBadge('Señalización', item.signage)}{renderBadge('Etiquetas', item.labels)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-50">
          {renderBadge('Rótulo Químico', item.chemical_label)}{renderBadge('Sello Seg.', item.seal)}{renderBadge('Pintura', item.paint)}{renderBadge('Acceso Visibilidad', item.visibility)}{renderBadge('Corrosión', item.corrosion)}{renderBadge('Manómetro', item.manometer)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-50">
          {renderBadge('Agente Extintor', item.agent_state)}{renderBadge('Presión', item.pressure)}{renderBadge('Pin o Seguro', item.pin)}{renderBadge('Válvula Palanca', item.valve)}{renderBadge('Manija Traslado', item.handle)}{renderBadge('Manguera', item.hose)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-50">
          {renderBadge('Boquilla / Cono', item.nozzle)}{renderBadge('Cilindro', item.cylinder)}{renderBadge('Tubo Sifon', item.siphon)}{renderBadge('Observaciones', item.obs || 'Sin novedades')}
        </div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFireCabinetItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Gabinete #{item.number || i+1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">{renderBadge('No. Gabinete', item.number)}{renderBadge('Ubicación', item.location)}{renderBadge('Estado Gabinete', item.state)}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-50">
          {renderBadge('Vidrio', item.glass)}{renderBadge('Hacha', item.axe)}{renderBadge('Manguera', item.hose)}{renderBadge('Boquilla', item.nozzle)}{renderBadge('Llave Spanner', item.spanner)}{renderBadge('Soporte Mangueras', item.support)}{renderBadge('Válvula', item.valve)}
        </div>
        <div className="grid grid-cols-1 pt-2 border-t border-slate-100">{renderBadge('Observaciones', item.obs || 'Sin novedades')}</div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFirstAidKitItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Botiquín #{i+1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {renderBadge('Área', item.area)}{renderBadge('Ubicación', item.location)}{renderBadge('Gasas Limpias X 20', item.gauze_clean)}{renderBadge('Esparadrapo 4"', item.tape_cloth)}{renderBadge('Bajalenguas X 20', item.tongue_depressor)}{renderBadge('Guantes Latex X 100', item.latex_gloves)}{renderBadge('Venda Elástica 2"', item.elastic_bandage_2)}{renderBadge('Venda Elástica 3"', item.elastic_bandage_3)}{renderBadge('Venda Elástica 5"', item.elastic_bandage_5)}{renderBadge('Venda Algodón 3"', item.cotton_bandage_3)}{renderBadge('Venda Algodón 5"', item.cotton_bandage_5)}{renderBadge('Yodopovidona 120ml', item.iodopovidone)}{renderBadge('Saline 250/500cc', item.saline_solution)}{renderBadge('Termómetro', item.thermometer)}{renderBadge('Alcohol 275ml', item.alcohol)}
        </div>
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">{renderBadge('Observaciones', item.obs || 'Sin novedades')}</div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStretcherItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Camilla #{i+1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{renderBadge('Área', item.area)}{renderBadge('Ubicación', item.location)}{renderBadge('¿Visible?', item.visible)}{renderBadge('¿Señalizada?', item.signaled)}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
          {renderBadge('Fácil acceso', item.access)}{renderBadge('Correas seg.', item.straps)}{renderBadge('Inmov. cervical', item.cervical_immobilizer)}{renderBadge('Inmov. miembros', item.limbs_immobilizer)}{renderBadge('Estado Soporte', item.support_state)}{renderBadge('Estado Material', item.material_state)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
          {renderBadge('Higiene Inmov. Cervical', item.cervical_cleanliness)}{renderBadge('Higiene Inmov. Miembros', item.limbs_cleanliness)}{renderBadge('Higiene Camilla', item.stretcher_cleanliness)}
        </div>
        <div className="grid grid-cols-1 pt-2 border-t border-slate-100">{renderBadge('Observaciones', item.obs || 'Sin novedades')}</div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSafetyConditionItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Hallazgo de Seguridad #{i+1}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{renderBadge('Área', item.area)}{renderBadge('Ubicación', item.location || item.area)}{renderBadge('Tipo de Peligro', item.dangerType)}</div>
        <div className="grid grid-cols-1">{renderBadge('Descripción Condición Encontrada', item.description)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <div className="md:col-start-1 md:col-end-2">{renderBadge('Tipo de Acción', item.actionType)}</div>
        </div>
        <div className="grid grid-cols-1">{renderBadge('Descripción Acción a Implementar', item.actionImplementation)}</div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSignageItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Señalización #{i+1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {renderBadge('Area', item.area)}{renderBadge('Ubicación', item.location)}{renderBadge('Tipo de Señal', item.signalType)}{renderBadge('Cantidad', item.quantity)}{renderBadge('Estado', item.state)}{renderBadge('Observaciones', item.obs || 'Sin novedades')}
        </div>
        {(item.photo1 || item.photo2) && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[7px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={8} /> Registro Fotográfico</span>
            <div className="flex gap-2">
              {item.photo1 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo1} className="w-full h-full object-cover" /></div>}
              {item.photo2 && <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={item.photo2} className="w-full h-full object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStandardItem = (item: any, i: number) => (
    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4 break-inside-avoid">
      <div className="px-4 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Ítem #{i+1}</span>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {renderBadge('Ubicación/Área', item.area || item.location)}{renderBadge('Estado/Nivel', item.state || item.riskLevel || 'CONFORME')}
        <div className="col-span-2 md:col-span-4 mt-1">{renderBadge('Observaciones', item.obs || item.description || 'Sin novedades')}</div>
      </div>
    </div>
  );

  const renderDataDetail = (ins: any) => {
    const items = ins.items || ins.findings || [];
    const isSignage = ins._module === 'SIGNAGE';
    const isFirstAid = ins._module === 'FIRST_AID_KITS';
    const isStretcher = ins._module === 'STRETCHERS';
    const isSafety = ins._module === 'SAFETY_CONDITIONS';
    const isFireCabinet = ins._module === 'FIRE_CABINETS';
    const isExtinguisher = ins._module === 'EXTINGUISHERS';

    return (
      <div className="mt-4 space-y-6">
        {renderInfoGeneralHead(ins)}

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 border-l-4 border-slate-300 pl-3">
             <h3 className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Detalle Técnico de Inspección</h3>
          </div>
          {items.map((item: any, i: number) => {
            if (isExtinguisher) return renderExtinguisherItem(item, i);
            if (isFireCabinet) return renderFireCabinetItem(item, i);
            if (isSafety) return renderSafetyConditionItem(item, i);
            if (isFirstAid) return renderFirstAidKitItem(item, i);
            if (isStretcher) return renderStretcherItem(item, i);
            if (isSignage) return renderSignageItem(item, i);
            return renderStandardItem(item, i);
          })}

          <div className="flex flex-wrap items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-32 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 p-1">
                 {ins.signature_url ? <img src={ins.signature_url} className="max-h-full object-contain" /> : <span className="text-[8px] text-slate-300 uppercase">Sin Firma</span>}
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Firma Responsable</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Validación Técnico SST</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onEdit(ins, ins._module); }} className="p-3 bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"><Edit3 size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); generatePDF(ins); }} disabled={isExporting === ins.id} className="p-3 px-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs flex items-center gap-2 disabled:opacity-50">
                {isExporting === ins.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                {isExporting === ins.id ? "GENERANDO..." : "DESCARGAR PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredInspections = inspections.filter(ins => ins.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ins.consecutive?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (<div className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-900 mb-4" size={40} /><p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Cargando historial...</p></div>);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 sticky top-20 z-20">
        <Search size={20} className="text-blue-900" />
        <input type="text" placeholder="Filtrar por edificio o consecutivo..." className="w-full outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="space-y-4 pb-20">
        {filteredInspections.length > 0 ? filteredInspections.map((ins) => {
          const isExpanded = expandedId === ins.id;
          const Icon = moduleConfig[ins._module]?.icon || FileText;
          return (
            <div key={ins.id} className={`bg-white rounded-[2rem] border-2 transition-all duration-300 ${isExpanded ? 'border-blue-600 shadow-xl' : 'border-slate-100'}`}>
              <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => toggleExpand(ins.id)}>
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl ${isExpanded ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900'}`}><Icon size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{ins.consecutive}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-3"><span>{ins.display_name}</span><span>{ins.display_date}</span></p>
                  </div>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-300'}`} />
              </div>
              <div className={`${isExpanded ? 'block' : 'hidden'} px-6 pb-6 border-t border-slate-50`}>{renderDataDetail(ins)}</div>
            </div>
          );
        }) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl"><FileSearch size={40} className="mx-auto text-slate-200 mb-2" /><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No se encontraron registros</p></div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
