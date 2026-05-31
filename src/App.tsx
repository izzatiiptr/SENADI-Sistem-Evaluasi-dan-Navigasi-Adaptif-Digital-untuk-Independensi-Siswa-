import { useState } from 'react';
import { User } from './types';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import MuridDashboard from './components/MuridDashboard';
import GuruDashboard from './components/GuruDashboard';
import Profile from './components/Profile';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, UserCircle } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 pb-20 md:pb-8">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 mb-8 p-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF5F5] rounded-xl flex items-center justify-center shrink-0 border border-red-100">
            <img 
              src="/logo senadi.png" 
              alt="SENADI Logo" 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-wide mt-1">SENADI Memahami, Sekolah Menemani</span>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-full p-1 space-x-1">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`p-2 px-4 rounded-full flex items-center gap-2 text-sm font-bold transition-colors ${currentView === 'dashboard' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutDashboard size={16} /> <span className="hidden md:inline">Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={`p-2 px-4 rounded-full flex items-center gap-2 text-sm font-bold transition-colors ${currentView === 'profile' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserCircle size={16} /> <span className="hidden md:inline">Profil</span>
          </button>
        </div>
      </header>

      <main className="px-4">
         <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'profile' && <Profile user={user} onLogout={() => setUser(null)} />}
              {currentView === 'dashboard' && user.role === 'murid' && <MuridDashboard user={user} />}
              {currentView === 'dashboard' && user.role === 'guru' && <GuruDashboard user={user} />}
            </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
}
