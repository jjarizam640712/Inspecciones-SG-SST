
import React, { useState } from 'react';
import { InspectionModule, UserProfile } from '../types';
import { NAVIGATION_MENU } from '../constants';
import { ShieldCheck, ChevronDown, ChevronRight, History, Settings, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  onModuleSelect: (module: InspectionModule, filter?: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ onModuleSelect, isOpen, setIsOpen, user }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full bg-[#1e3a8a] text-blue-100 w-72 z-50 transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center gap-4 border-b border-blue-800/50">
          <div className="bg-white p-2.5 rounded-2xl"><ShieldCheck className="text-[#1e3a8a]" size={32} /></div>
          <div>
            <h2 className="font-black text-white text-lg leading-tight">SG-SST Suite</h2>
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">INSPECCIONES PRO</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
          {user.role === 'SUPER_ADMIN' && (
            <button onClick={() => onModuleSelect('ADMIN_PANEL')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold hover:bg-white/10">
              <LayoutDashboard size={18} /> <span>Panel Maestro</span>
            </button>
          )}
          {NAVIGATION_MENU.filter(m => m.id !== 'HISTORY').map((item) => (
            <button key={item.id} onClick={() => onModuleSelect(item.id as InspectionModule)} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold hover:bg-white/10">
              <item.icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[14px] font-bold hover:bg-white/10">
            <div className="flex items-center gap-4"><History size={18} /> <span>Historial</span></div>
            {isHistoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </nav>
        <div className="p-4 border-t border-blue-800/50">
          <button onClick={() => onModuleSelect('USER_PROFILE')} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black">{user.buildingName.charAt(0)}</div>
            <div className="flex-1 overflow-hidden"><p className="text-[11px] font-black text-white truncate">{user.buildingName}</p></div>
            <Settings size={16} className="text-blue-400" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
