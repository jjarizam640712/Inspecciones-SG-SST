
import React, { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import SafetyConditionsForm from './components/SafetyConditionsForm';
import FireCabinetsForm from './components/FireCabinetsForm';
import ExtinguishersForm from './components/ExtinguishersForm';
import StretchersForm from './components/StretchersForm';
import FirstAidKitsForm from './components/FirstAidKitsForm';
import SignageForm from './components/SignageForm';
import HistoryView from './components/HistoryView';
import AdminPanel from './components/AdminPanel';
import UserProfileEdit from './components/UserProfileEdit';
import { InspectionModule, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentModule, setCurrentModule] = useState<InspectionModule>('SAFETY_CONDITIONS');
  const [historyFilter, setHistoryFilter] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const handleModuleSelect = (module: InspectionModule, filter?: string) => {
    setCurrentModule(module);
    setHistoryFilter(filter);
    setIsSidebarOpen(false);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'SAFETY_CONDITIONS': return <SafetyConditionsForm userProfile={user} />;
      case 'FIRE_CABINETS': return <FireCabinetsForm userProfile={user} />;
      case 'EXTINGUISHERS': return <ExtinguishersForm userProfile={user} />;
      case 'STRETCHERS': return <StretchersForm userProfile={user} />;
      case 'FIRST_AID_KITS': return <FirstAidKitsForm userProfile={user} />;
      case 'SIGNAGE': return <SignageForm userProfile={user} />;
      case 'HISTORY': return <HistoryView filter={historyFilter} onEdit={() => {}} />;
      case 'ADMIN_PANEL': return user.role === 'SUPER_ADMIN' ? <AdminPanel /> : null;
      case 'USER_PROFILE': return <UserProfileEdit user={user} onUpdate={setUser} />;
      default: return <SafetyConditionsForm userProfile={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-700">
      <Sidebar 
        onModuleSelect={handleModuleSelect} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        user={user}
      />

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="bg-[#1e3a8a] text-white sticky top-0 z-30 h-16 flex items-center px-4 lg:px-8 shadow-md">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-2">
            <Menu size={24} />
          </button>
          <div className="flex-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-300">SG-SST Suite v2.5</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold bg-blue-700 px-3 py-1 rounded-full">{user.clientCode}</span>
            <button onClick={() => setUser(null)} className="text-blue-200 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default App;
