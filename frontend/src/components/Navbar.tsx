'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch (e) { setUser(null); }
        }
    }, []);

    return (
        <header className="w-full bg-slate-900/85 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex justify-between items-center z-50 sticky top-0">
            <Link href="/" className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
                ✨ Созвездия
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/map" className="hover:text-cyan-400 transition">🗺️ Карта</Link>
                <Link href="/encyclopedia" className="hover:text-cyan-400 transition">📖 Энциклопедия</Link>
                <Link href="/date-finder" className="hover:text-cyan-400 transition">📅 По дате</Link>
                <Link href="/quiz" className="hover:text-cyan-400 transition">🚀 Викторина</Link>
                <Link href="/dashboard" className="text-cyan-400 border border-cyan-500/40 px-4 py-2 rounded-xl hover:bg-cyan-500/10 transition">
                    📊 Дашборд
                </Link>
                {user ? (
                    <span className="bg-purple-950/60 text-purple-300 border border-purple-700/50 px-3 py-1.5 rounded-xl font-mono text-xs">
                        👤 {user.username} ({user.role})
                    </span>
                ) : (
                    <Link href="/auth/login" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition">
                        Войти
                    </Link>
                )}
            </nav>
        </header>
    );
}