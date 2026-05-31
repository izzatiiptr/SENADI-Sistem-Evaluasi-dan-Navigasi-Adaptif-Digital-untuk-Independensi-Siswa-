import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'murid' | 'guru' | null>(null);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Login gagal, coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi! 👋';
    if (hour < 15) return 'Selamat siang! 👋';
    if (hour < 18) return 'Selamat sore! 👋';
    return 'Selamat malam! 👋';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-8 pb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}</h1>
          <p className="text-gray-500 mb-8">Pilih peran kamu untuk masuk ke SENADI</p>

          <div className="flex gap-4 justify-center mb-8">
            <button
              type="button"
              onClick={() => { setRole('murid'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${role === 'murid' ? 'bg-[#FF6B6B] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Murid
            </button>
            <button
              type="button"
              onClick={() => { setRole('guru'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${role === 'guru' ? 'bg-[#4ECDC4] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Guru BK
            </button>
          </div>
        </div>

        <AnimatePresence>
          {role && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 pb-8"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {role === 'murid' ? 'NISN' : 'NIP'}
                  </label>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all"
                    placeholder={`Masukkan ${role === 'murid' ? 'NISN' : 'NIP'} kamu...`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all"
                    placeholder="Masukkan password..."
                  />
                </div>
                
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-70 mt-4"
                >
                  {loading ? 'Masuk...' : 'Masuk sekarang'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
