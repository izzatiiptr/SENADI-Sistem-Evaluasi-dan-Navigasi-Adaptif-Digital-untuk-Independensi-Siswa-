import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000); // Tampil selama 5 detik
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F5F5F5] z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <img 
          src="/logo senadi.png" 
          alt="SENADI Logo" 
          className="h-32 md:h-48 object-contain mb-6 drop-shadow-lg"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="text-sm md:text-base text-gray-500 font-semibold tracking-wide text-center"
        >
          SENADI Memahami, Sekolah Menemani
        </motion.p>
      </motion.div>
    </div>
  );
}
