import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LiterasiEntry, CurhatMessage } from '../types';
import { Users, AlertTriangle, MessageCircle } from 'lucide-react';

export default function GuruDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'triage' | 'inbox'>('triage');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm overflow-x-auto border border-gray-100">
        <TabButton icon={<Users size={18}/>} label="Triage & Notifikasi" isActive={activeTab === 'triage'} onClick={() => setActiveTab('triage')} />
        <TabButton icon={<MessageCircle size={18}/>} label="Inbox Curhat" isActive={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]"
      >
        {activeTab === 'triage' && <TriageView />}
        {activeTab === 'inbox' && <InboxCurhat guruNip={user.nip!} />}
      </motion.div>
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${isActive ? 'bg-[#4ECDC4] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      {icon} {label}
    </button>
  );
}

// --- Triage View ---
function TriageView() {
  const [triage, setTriage] = useState<LiterasiEntry[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/guru/triage').then(r=>r.json()).then(d => {
      if(d.success) setTriage(d.result);
    });
    fetch('/api/guru/trend-warnings').then(r=>r.json()).then(d => {
      if(d.success) setWarnings(d.result);
    });
  }, []);

  return (
    <div className="p-8 space-y-8">
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Notifikasi Tren Menurun</h3>
          <div className="grid gap-3">
            {warnings.map((w, i) => (
              <div key={i} className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{w.nama} <span className="text-sm font-normal text-gray-500 ml-2">({w.nisn})</span></div>
                  <div className="text-orange-600 font-medium text-sm mt-1">{w.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-800 mb-4 text-xl">Daftar Evaluasi Literasi (Triage)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 pb-2 flex-grow">
                <th className="p-4 bg-gray-50 rounded-l-xl">Murid</th>
                <th className="p-4 bg-gray-50 text-center">Skor Literasi</th>
                <th className="p-4 bg-gray-50 text-center">Risiko Mental</th>
                <th className="p-4 bg-gray-50 rounded-r-xl w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {triage.length === 0 && (
                <tr><td colSpan={4} className="text-center p-8 text-gray-400">Belum ada data evaluasi.</td></tr>
              )}
              {triage.map(entry => {
                const isRedFlag = entry.skor_risiko_mental > 75;
                return (
                  <tr key={entry.id} className={`shadow-sm transition-all ${isRedFlag ? 'bg-[#FFF5F5] border-l-4 border-l-red-500' : 'bg-white border border-gray-100'}`}>
                    <td className="p-4 rounded-l-xl border-y border-l border-gray-100">
                      <div className="font-bold text-gray-800">{entry.nama_murid}</div>
                      <div className="text-sm text-gray-500">{entry.nisn}</div>
                    </td>
                    <td className="p-4 text-center border-y border-gray-100 font-medium text-gray-700">{entry.skor_literasi}</td>
                    <td className="p-4 text-center border-y border-gray-100">
                      <span className={`font-black text-lg ${isRedFlag ? 'text-red-600' : 'text-gray-800'}`}>{entry.skor_risiko_mental}</span>
                    </td>
                    <td className="p-4 rounded-r-xl border-y border-r border-gray-100">
                      {isRedFlag ? (
                        <div className="inline-flex items-center justify-center bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs uppercase animate-pulse">
                          Red Flag
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs uppercase">
                          Aman
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Inbox Curhat ---
function InboxCurhat({ guruNip }: { guruNip: string }) {
  const [messages, setMessages] = useState<CurhatMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetch(`/api/curhat/all/${guruNip}`).then(r=>r.json()).then(d => {
      if(d.success) setMessages(d.result);
    });
  }, [guruNip]);

  const usersInChat = Array.from(new Set(messages.map(m => m.user_id)));

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedUser || !reply) return;
    
    await fetch('/api/guru/curhat', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nisn: selectedUser, guru_nip: guruNip, message: reply })
    });
    setReply('');
    const res = await fetch(`/api/curhat/${selectedUser}/${guruNip}`);
    const data = await res.json();
    if(data.success) {
      // Re-fetch all to keep users list and current thread up to date
      const allRes = await fetch(`/api/curhat/all/${guruNip}`);
      const allData = await allRes.json();
      if(allData.success) setMessages(allData.result);
    }
  };

  const activeThread = messages.filter(m => m.user_id === selectedUser);

  return (
    <div className="flex h-[600px]">
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 font-bold text-gray-700 uppercase tracking-wider text-sm sticky top-0 bg-gray-50">
          Inbox Murid
        </div>
        <div className="flex-1 overflow-y-auto">
          {usersInChat.length === 0 && <div className="p-4 text-gray-400 text-sm">Kosong.</div>}
          {usersInChat.map(uid => (
            <button 
              key={uid}
              onClick={() => setSelectedUser(uid)}
              className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${selectedUser === uid ? 'bg-white shadow-sm border-l-4 border-l-[#4ECDC4]' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
            >
              <div className="font-bold text-gray-800">NISN: {uid}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-white">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Pilih pesan di sebelah kiri untuk membalas</div>
        ) : (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeThread.map(chat => (
                <div key={chat.id} className={`max-w-[80%] ${chat.is_from_guru ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                  <div className={`inline-block p-4 rounded-2xl shadow-sm ${chat.is_from_guru ? 'bg-[#4ECDC4] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {chat.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
               <form onSubmit={handleReply} className="flex gap-2">
                 <input 
                   type="text"
                   value={reply}
                   onChange={e => setReply(e.target.value)}
                   className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#4ECDC4]"
                   placeholder="Balas curhatan..."
                 />
                 <button type="submit" disabled={!reply} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-50">Balas</button>
               </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
