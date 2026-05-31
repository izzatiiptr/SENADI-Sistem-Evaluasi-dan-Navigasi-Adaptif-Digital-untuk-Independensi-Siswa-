import { useState } from 'react';
import { User } from '../types';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(true);
      setMessage("Password baru tidak sinkron.");
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.role === 'murid' ? user.nisn : user.nip, 
          role: user.role, 
          oldPassword, 
          newPassword 
        })
      });
      const data = await res.json();
      setError(!data.success);
      setMessage(data.message);
      if (data.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError(true);
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FFF5F5]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.nama}</h2>
          <p className="text-sm text-[#FF6B6B] font-medium mt-1">
            {user.role === 'murid' ? `NISN: ${user.nisn}` : `NIP: ${user.nip}`}
          </p>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-full transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ganti Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#FF6B6B] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#FF6B6B] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#FF6B6B] outline-none"
            />
          </div>

          {message && (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} 
              className={`text-sm p-3 rounded-xl ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-70 mt-2"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
