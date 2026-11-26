'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardTabs from '@/components/DashboardTabs';
import { BookOpen, ArrowUpDown, Trash2, Save } from 'lucide-react';

type ConstellationSort = 'name-asc' | 'name-desc' | 'latin-asc' | 'latin-desc';

export default function EncyclopediaPage() {
    const [user, setUser] = useState<any>(null);
    const [constellations, setConstellations] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<ConstellationSort>('name-asc');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [latin, setLatin] = useState('');
    const [description, setDescription] = useState('');
    const [season, setSeason] = useState('Зима');
    const [stars, setStars] = useState<any[]>([]);
    const [lines, setLines] = useState<any[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        loadConstellations();
    }, []);

    const loadConstellations = () => {
        fetch('http://127.0.0.1:8000/api/constellations')
            .then((res) => res.json())
            .then((data) => setConstellations(data))
            .catch(() => { });
    };

    const sortedItems = [...constellations].sort((a, b) => {
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '', 'ru');
        if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '', 'ru');
        if (sortBy === 'latin-asc') return (a.latin || '').localeCompare(b.latin || '', 'en');
        return (b.latin || '').localeCompare(a.latin || '', 'en');
    });

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setName(item.name || '');
        setLatin(item.latin || '');
        setDescription(item.description || '');
        setSeason(item.season || 'Зима');
        setStars(item.stars || []);
        setLines(item.lines || []);
        setMessage('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId || user?.role !== 'admin') return;
        setMessage('');

        const res = await fetch(`http://127.0.0.1:8000/api/constellations/${editingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': 'admin',
            },
            body: JSON.stringify({ name, latin, description, season, stars, lines }),
        });

        if (res.ok) {
            setMessage('Созвездие обновлено');
            setEditingId(null);
            loadConstellations();
        } else {
            setMessage('Ошибка при сохранении');
        }
    };

    const handleDelete = async (id: number) => {
        if (user?.role !== 'admin') return;
        if (!confirm('Удалить созвездие?')) return;
        const res = await fetch(`http://127.0.0.1:8000/api/constellations/${id}`, {
            method: 'DELETE',
            headers: { 'X-User-Role': 'admin' },
        });
        if (res.ok) {
            if (editingId === id) setEditingId(null);
            loadConstellations();
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
                <DashboardTabs role={user?.role || 'guest'} />

                <div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-cyan-400" />
                            <h1 className="text-xl font-bold text-white">Энциклопедия созвездий</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as ConstellationSort)}
                                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                            >
                                <option value="name-asc">Название: А → Я</option>
                                <option value="name-desc">Название: Я → А</option>
                                <option value="latin-asc">Латинское имя: A → Z</option>
                                <option value="latin-desc">Латинское имя: Z → A</option>
                            </select>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-purple-500/20 border border-purple-500/40 text-purple-200 px-4 py-3 rounded-xl text-sm">
                            {message}
                        </div>
                    )}

                    {editingId && (
                        <form onSubmit={handleUpdate} className="bg-slate-950/95 border border-purple-500/40 p-5 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base font-bold text-cyan-300">Редактирование записи #{editingId}</h2>
                                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-white underline">
                                    Закрыть
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                                <input type="text" required value={latin} onChange={(e) => setLatin(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                                <select value={season} onChange={(e) => setSeason(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none">
                                    <option value="Зима">Зима</option>
                                    <option value="Весна">Весна</option>
                                    <option value="Лето">Лето</option>
                                    <option value="Осень">Осень</option>
                                </select>
                            </div>
                            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                            <div className="flex flex-wrap items-center gap-3">
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
                                    <Save className="w-4 h-4" />
                                    <span>Сохранить</span>
                                </button>
                                <Link href={`/admin/stars?id=${editingId}`} className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-4 py-2 rounded-xl text-xs font-semibold">
                                    Открыть звёзды на странице
                                </Link>
                            </div>
                        </form>
                    )}

                    <div className="space-y-2.5">
                        {sortedItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                            >
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-white text-sm">{item.name}</span>
                                        <span className="text-xs font-mono text-slate-400">({item.latin})</span>
                                        <span className="text-[11px] bg-slate-900 text-cyan-300 border border-slate-800 px-2 py-0.5 rounded">
                                            {item.season}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{item.description}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button type="button" onClick={() => startEdit(item)} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                        Изменить
                                    </button>
                                    <Link href={`/admin/stars?id=${item.id}`} className="bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                        Звёзды ({item.stars?.length || 0})
                                    </Link>
                                    <button type="button" onClick={() => handleDelete(item.id)} className="bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 p-1.5 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}