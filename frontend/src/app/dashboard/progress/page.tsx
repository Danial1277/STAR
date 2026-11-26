'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardTabs from '@/components/DashboardTabs';
import { Award, CheckCircle2, Heart } from 'lucide-react';

export default function UserProgressPage() {
    const [user, setUser] = useState<any>(null);
    const [constellations, setConstellations] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [studied, setStudied] = useState<number[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                setFavorites(parsed.favorites || []);
                setStudied(parsed.studied || []);
            } catch { }
        }
        fetch('http://127.0.0.1:8000/api/constellations')
            .then((res) => res.json())
            .then((data) => setConstellations(data))
            .catch(() => { });
    }, []);

    const syncProgress = async (nextFavs: number[], nextStudied: number[]) => {
        setFavorites(nextFavs);
        setStudied(nextStudied);
        if (!user || user.role !== 'user') return;

        const updated = { ...user, favorites: nextFavs, studied: nextStudied };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));

        await fetch('http://127.0.0.1:8000/api/users/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, favorites: nextFavs, studied: nextStudied }),
        }).catch(() => { });
    };

    const toggleFavorite = (id: number) => {
        const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
        syncProgress(next, studied);
    };

    const toggleStudied = (id: number) => {
        const next = studied.includes(id) ? studied.filter((x) => x !== id) : [...studied, id];
        syncProgress(favorites, next);
    };

    const points = studied.length * 15 + (user?.score || 0);
    const rankTitle = points >= 90 ? 'Хранитель неба' : points >= 50 ? 'Астроном' : points >= 20 ? 'Наблюдатель' : 'Новичок';

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
                <DashboardTabs role={user?.role || 'guest'} />

                <div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-cyan-400" />
                            <h1 className="text-xl font-bold text-white">Прогресс исследователя — {rankTitle}</h1>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                            Изучено: {studied.length} / {constellations.length} • Избранное: {favorites.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {constellations.map((c) => {
                            const isFav = favorites.includes(c.id);
                            const isDone = studied.includes(c.id);
                            return (
                                <div key={c.id} className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex justify-between items-center gap-3">
                                    <div>
                                        <p className="font-bold text-white text-sm">{c.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{c.latin} • {c.season}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleStudied(c.id)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isDone ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>{isDone ? 'Изучено' : 'Отметить'}</span>
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(c.id)}
                                            className={`p-2 rounded-lg border transition ${isFav ? 'bg-rose-950/80 text-rose-400 border-rose-700' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-rose-400'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}