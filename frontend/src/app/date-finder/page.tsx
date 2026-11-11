'use client';
import { useState } from 'react';

export default function DateFinderPage() {
    const [date, setDate] = useState('');
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!date) return;

        const [year, month, day] = date.split('-').map(Number);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/constellations/by-date?month=${month}&day=${day}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Ошибка поиска');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl z-10">
                <div className="flex justify-between items-center mb-6">
                    <a href="/" className="text-slate-400 hover:text-cyan-400 transition text-sm font-semibold">
                        ← На главную
                    </a>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        ✨ Созвездие по дате
                    </h1>
                </div>

                <p className="text-slate-400 text-sm mb-6 text-center">
                    Введите дату рождения или памятный день, чтобы узнать своё космическое созвездие.
                </p>

                <form onSubmit={handleSearch} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Выберите дату</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/25"
                    >
                        Узнать созвездие
                    </button>
                </form>

                {error && (
                    <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 rounded-xl text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-white">{result.name}</h3>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
                                {result.latin}
                            </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">{result.description}</p>
                        <div className="text-xs text-slate-400 space-y-1 border-t border-slate-800 pt-2">
                            <p>📍 Сезон: <span className="text-slate-200">{result.season}</span></p>
                            <p>✨ Миф: <span className="text-slate-200">{result.history}</span></p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}