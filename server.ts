import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Mock Databases ---
const db_murid = [
  { nisn: "0056845905", nama: "Izzati Kamila Putri", password_hash: "0056845905" }
];

const db_guru_bk = [
  { nip: "111", nama: "Ida Yunita Sari, S.Psi", spesialisasi: "Konseling Psikologi & Emosi", password: "guru1" },
  { nip: "222", nama: "Farillah Herdiani, S.Pd", spesialisasi: "Pengembangan Karakter & Motivasi", password: "guru2" },
  { nip: "333", nama: "Kharisma Cahyandini, S.Pd", spesialisasi: "Masalah Sosial & Pertemanan", password: "guru3" }
];

const db_vibe_check: any[] = [];
const db_literasi: any[] = [];
const db_curhat: any[] = [];

// Helper to get Gemini client
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { "User-Agent": "aistudio-build" },
    },
  });
}

// --- API Routes ---

app.post("/api/login", (req, res) => {
  const { id, password, role } = req.body;
  if (role === 'murid') {
    const user = db_murid.find(u => u.nisn === id && u.password_hash === password);
    if (user) return res.json({ success: true, user: { ...user, role: 'murid' } });
  } else if (role === 'guru') {
    const user = db_guru_bk.find(u => u.nip === id && u.password === password);
    if (user) return res.json({ success: true, user: { ...user, role: 'guru' } });
  }
  res.status(401).json({ success: false, message: "ID atau Password salah. Silakan coba lagi." });
});

app.post("/api/change-password", (req, res) => {
  const { id, role, oldPassword, newPassword } = req.body;
  if (role === 'murid') {
    const user = db_murid.find(u => u.nisn === id);
    if (user && user.password_hash === oldPassword) {
      user.password_hash = newPassword;
      return res.json({ success: true, message: "Password berhasil diubah!" });
    }
  } else if (role === 'guru') {
    const user = db_guru_bk.find(u => u.nip === id);
    if (user && user.password === oldPassword) {
      user.password = newPassword;
      return res.json({ success: true, message: "Password berhasil diubah!" });
    }
  }
  res.status(400).json({ success: false, message: "Password lama tidak sesuai." });
});

app.post("/api/murid/vibe", (req, res) => {
  const { nisn, score } = req.body;
  db_vibe_check.push({ nisn, score, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.post("/api/murid/literasi", async (req, res) => {
  const { nisn, url } = req.body;
  try {
    const ai = getAI();
    
    // Simulate image extraction by just using a dummy string and prompt. 
    // In a real app we'd fetch the IG post.
    const prompt = `
      Anda adalah AI penganalisa tugas Jurnal Literasi dari postingan Instagram murid.
      URL Tugas: ${url}
      Tolong evaluasi postingan ini berdasarkan simulasi gambar dan caption (karena tidak ada akses internet langsung, asumsikan ini adalah post literasi).
      Berikan skor JSON dengan STRICT format. 
      - skor_literasi (1-100): 1-30 tidak relevan, 31-70 pemahaman biasa, 71-100 kritis/reflektif.
      - skor_risiko_mental (1-100): LOGIKA TERBALIK. 1-30 sehat, 31-70 stres ringan, 71-100 indikasi butuh bantuan.
      - is_valid: boolean, true jika ini terlihat seperti post tugas.
      - pesan_apresiasi: Kalimat pendek apresiatif gen-z.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skor_literasi: { type: Type.INTEGER },
            skor_risiko_mental: { type: Type.INTEGER },
            is_valid: { type: Type.BOOLEAN },
            pesan_apresiasi: { type: Type.STRING }
          },
          required: ["skor_literasi", "skor_risiko_mental", "is_valid", "pesan_apresiasi"]
        }
      }
    });

    let data = JSON.parse(response.text || "{}");
    const entry = { id: Date.now().toString(), nisn, url, ...data, timestamp: new Date().toISOString() };
    db_literasi.push(entry);
    res.json({ success: true, result: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menganalisis jurnal." });
  }
});

app.post("/api/murid/curhat", async (req, res) => {
  const { nisn, guru_nip, topik, message } = req.body;
  const newMsg = {
    id: Date.now().toString(),
    is_from_guru: false,
    user_id: nisn,
    guru_nip,
    topik,
    message,
    timestamp: new Date().toISOString()
  };
  db_curhat.push(newMsg);

  try {
    const ai = getAI();
    const prompt = `Seorang murid dengan NISN ${nisn} baru saja mengirimkan keluh kesah atau cerita (Topik: ${topik}) kepada Guru BK. Pesan: "${message}". Berikan autoreply penenang instan yang singkat dan ramah dari sudut pandang asisten Guru BK SENADI, sebelum Guru BK asli membalasnya. Jangan berikan nasihat berat, hanya validasi emosinya dan pastikan pesan sudah diteruskan.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const reply = {
      id: Date.now().toString() + "_AI",
      is_from_guru: true, // as an automated reply from the 'system' on behalf
      user_id: nisn,
      guru_nip,
      topik,
      message: response.text || "Pesan kamu sudah sampai, tunggu balasan ya!",
      timestamp: new Date().toISOString()
    };
    db_curhat.push(reply);

    res.json({ success: true, ai_reply: reply });
  } catch (err) {
    console.error(err);
    res.json({ success: true });
  }
});

app.get("/api/guru/triage", (req, res) => {
  // Sort by skor_risiko_mental desc
  let entries = [...db_literasi].sort((a, b) => b.skor_risiko_mental - a.skor_risiko_mental);
  // Join student names
  entries = entries.map(e => {
    const murid = db_murid.find(m => m.nisn === e.nisn);
    return { ...e, nama_murid: murid?.nama || 'Unknown' };
  });
  res.json({ success: true, result: entries });
});

app.get("/api/guru/trend-warnings", (req, res) => {
  // Peringatan jika <40 selama 3 entries berturut (simplification of '3 hari berturut')
  const warnings = [];
  for (const m of db_murid) {
    const vibes = db_vibe_check.filter(v => v.nisn === m.nisn).slice(-3); // mock 3 last days
    if (vibes.length >= 3 && vibes.every(v => v.score < 40)) {
      warnings.push({
        nisn: m.nisn,
        nama: m.nama,
        message: "Vibe Check < 40 selama 3 observasi terakhir."
      });
    }
  }
  res.json({ success: true, result: warnings });
});

app.get("/api/curhat/:user_id/:guru_nip", (req, res) => {
  const { user_id, guru_nip } = req.params;
  const msgs = db_curhat.filter(m => 
    (m.user_id === user_id || user_id === 'all') && 
    (m.guru_nip === guru_nip || guru_nip === 'all')
  );
  res.json({ success: true, result: msgs });
});

app.post("/api/guru/curhat", (req, res) => {
  const { nisn, guru_nip, message } = req.body;
  const newMsg = {
    id: Date.now().toString(),
    is_from_guru: true,
    user_id: nisn,
    guru_nip,
    message,
    timestamp: new Date().toISOString()
  };
  db_curhat.push(newMsg);
  res.json({ success: true });
});

app.get("/api/guru/list", (req, res) => {
  res.json({ success: true, result: db_guru_bk.map(g => ({ nip: g.nip, nama: g.nama, spesialisasi: g.spesialisasi })) });
});


// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
