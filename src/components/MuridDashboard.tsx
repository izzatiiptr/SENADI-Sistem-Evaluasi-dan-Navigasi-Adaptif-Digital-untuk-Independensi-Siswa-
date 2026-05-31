import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Guru, CurhatMessage } from '../types';
import { Smile, BookOpen, MessageCircle } from 'lucide-react';

interface Props {
  user: User;
}

export default function MuridDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'vibe' | 'literasi' | 'curhat'>('vibe');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm overflow-x-auto border border-gray-100">
        <TabButton icon={<Smile size={18}/>} label="Vibe Check" isActive={activeTab === 'vibe'} onClick={() => setActiveTab('vibe')} />
        <TabButton icon={<BookOpen size={18}/>} label="Jurnal Literasi" isActive={activeTab === 'literasi'} onClick={() => setActiveTab('literasi')} />
        <TabButton icon={<MessageCircle size={18}/>} label="Ruang Curhat" isActive={activeTab === 'curhat'} onClick={() => setActiveTab('curhat')} />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {activeTab === 'vibe' && <VibeCheck user={user} />}
        {activeTab === 'literasi' && <JurnalLiterasi user={user} />}
        {activeTab === 'curhat' && <RuangCurhat user={user} />}
      </motion.div>
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${isActive ? 'bg-[#FF6B6B] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      {icon} {label}
    </button>
  );
}

// --- Vibe Check ---
function VibeCheck({ user }: { user: User }) {
  const [score, setScore] = useState(50);
  const [saved, setSaved] = useState(false);

  const getSliderColor = (val: number) => {
    if (val <= 30) return '#FF6B6B'; // Merah Soft
    if (val <= 70) return '#ffd93d'; // Kuning Soft
    return '#4ECDC4'; // Biru Soft
  };

  const color = getSliderColor(score);

  const handleSave = async () => {
    await fetch('/api/murid/vibe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nisn: user.nisn, score })
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 text-center space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gimana harimu hari ini?</h2>
        <p className="text-gray-500 mt-2">Geser slider untuk mengekspresikan perasanmu.</p>
      </div>

      <div className="py-8">
        <input 
          type="range" 
          min="1" max="100" 
          value={score} 
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${score}%, #f3f4f6 ${score}%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-4 font-medium uppercase tracking-wide">
          <span>Stres / Lelah</span>
          <span>Biasa Aja</span>
          <span>Bahagia!</span>
        </div>
      </div>

      <div className="text-6xl font-black" style={{ color }}>{score}</div>

      <button 
        onClick={handleSave}
        className="w-full md:w-auto px-12 py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {saved ? 'Tersimpan!' : 'Simpan Vibe'}
      </button>
    </div>
  );
}

// --- Jurnal Literasi ---
function JurnalLiterasi({ user }: { user: User }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);

    const res = await fetch('/api/murid/literasi', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nisn: user.nisn, url })
    });
    const data = await res.json();
    if (data.success) {
      setResult(data.result);
    }
    setLoading(false);
    setUrl('');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Jurnal Literasi Digital</h2>
      <p className="text-gray-500 mb-6">Kumpul tugas Instagram kamu di sini. AI akan menganalisis konten dan captionnya.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="url"
          required
          placeholder="https://instagram.com/p/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#4ECDC4] outline-none transition-all"
        />
        <button 
          disabled={loading}
          type="submit"
          className="self-end px-8 py-4 bg-gray-900 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {loading ? 'AI sedang Menganalisis...' : 'Kirim Analisis'}
        </button>
      </form>

      {result && (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-100">
          {!result.is_valid ? (
            <div className="text-red-500 font-medium">Hmm, link / konten tidak valid. Pastikan gambar dan caption nyambung ya!</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4ECDC4]/20 border-l-4 border-l-[#4ECDC4]">
                <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Apresiasi Untukmu</h4>
                <p className="text-[#4ECDC4] font-medium text-lg mt-1">{result.pesan_apresiasi}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Skor Literasi</div>
                  <div className="text-3xl font-black text-gray-800">{result.skor_literasi}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Skala Risiko Mental</div>
                  <div className="text-3xl font-black text-[#FF6B6B]">{result.skor_risiko_mental}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// --- Ruang Curhat ---
function RuangCurhat({ user }: { user: User }) {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [selectedGuru, setSelectedGuru] = useState('');
  const [topik, setTopik] = useState('Akademik');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<CurhatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/guru/list').then(r=>r.json()).then(d => {
      if(d.success) {
        setGurus(d.result);
        if(d.result.length > 0) setSelectedGuru(d.result[0].nip);
      }
    })
  }, []);

  const loadChat = async () => {
    if(!selectedGuru) return;
    const res = await fetch(`/api/curhat/${user.nisn}/${selectedGuru}`);
    const data = await res.json();
    if(data.success) setChatHistory(data.result);
  };

  useEffect(() => { loadChat(); }, [selectedGuru]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!message || !selectedGuru) return;
    setLoading(true);

    const tempMsg: CurhatMessage = {
      id: Date.now().toString(),
      is_from_guru: false,
      user_id: user.nisn!,
      guru_nip: selectedGuru,
      message,
      timestamp: new Date().toISOString()
    };
    setChatHistory([...chatHistory, tempMsg]);

    const res = await fetch('/api/murid/curhat', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nisn: user.nisn, guru_nip: selectedGuru, topik, message })
    });
    const data = await res.json();
    if(data.success && data.ai_reply) {
      setChatHistory(prev => [...prev, data.ai_reply]);
    }
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-6 border-b border-gray-100 bg-[#FFF5F5]">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ruang Curhat Terarah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pilih Guru BK</label>
            <select value={selectedGuru} onChange={e => setSelectedGuru(e.target.value)} className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none">
              {gurus.map(g => (
                <option key={g.nip} value={g.nip}>{g.nama} - {g.spesialisasi}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Topik Curhat</label>
            <select value={topik} onChange={e => setTopik(e.target.value)} className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none">
              <option>Akademik</option>
              <option>Pribadi</option>
              <option>Keluarga</option>
              <option>Pertemanan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatHistory.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 font-medium">
            Belum ada curahan hati. Mulai sapa guru BK kamu!
          </div>
        )}
        {chatHistory.map(chat => (
          <div key={chat.id} className={`max-w-[75%] ${chat.is_from_guru ? 'mr-auto text-left' : 'ml-auto text-right'}`}>
             <div className={`inline-block p-4 rounded-2xl shadow-sm ${chat.is_from_guru ? 'bg-white text-gray-800 rounded-bl-none' : 'bg-[#FF6B6B] text-white rounded-br-none'}`}>
               {chat.message}
             </div>
          </div>
        ))}
        {loading && (
          <div className="mr-auto inline-block p-4 rounded-2xl bg-white text-gray-400 shadow-sm rounded-bl-none italic">
             AI sedang mengetik...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ketik curhatmu di sini..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#FF6B6B]"
          />
          <button type="submit" disabled={loading || !message} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-50">Kirim</button>
        </form>
      </div>
    </div>
  );
}
