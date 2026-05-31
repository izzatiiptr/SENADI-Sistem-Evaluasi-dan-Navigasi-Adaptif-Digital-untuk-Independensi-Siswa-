export interface User {
  role: 'murid' | 'guru';
  nama: string;
  nisn?: string;
  nip?: string;
  password?: string;
  password_hash?: string;
}

export interface Guru {
  nip: string;
  nama: string;
  spesialisasi: string;
}

export interface LiterasiEntry {
  id: string;
  nisn: string;
  nama_murid: string;
  url: string;
  skor_literasi: number;
  skor_risiko_mental: number;
  is_valid: boolean;
  pesan_apresiasi: string;
  timestamp: string;
}

export interface CurhatMessage {
  id: string;
  is_from_guru: boolean;
  user_id: string;
  guru_nip: string;
  topik?: string;
  message: string;
  timestamp: string;
}
