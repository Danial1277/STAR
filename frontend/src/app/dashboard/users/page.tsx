'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardTabs from '@/components/DashboardTabs';
import { Users, ArrowUpDown, Save } from 'lucide-react';

type UserSort = 'username-asc' | 'username-desc' | 'email-asc' | 'score-desc';

export default function UsersAdminPage() {
    const [user, setUser] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<UserSort>('username-asc');
    const [filter, setFilter] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                if (parsed.role === 'admin') loadUsers();
            } catch { }
        }
    }, []);

    const loadUsers = () => {
        fetch('http://127.0.0.1:8000/api/users', {
            headers: { 'X-User-Role': 'admin' },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setUsersList(data))
            .catch(() => { });
    };

    const filteredAndSorted = [...usersList]
        .filter((u) => {
            if (!filter.trim()) return true;
            const q = filter.toLowerCase();
            return (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        })
        .sort((a, b) => {
            if (sortBy === 'username-asc') return (a.username || '').localeCompare(b.username || '', 'ru');
            if (sortBy === 'username-desc') return (b.username || '').localeCompare(a.username || '', 'ru');
            if (sortBy === 'email-asc') return (a.email || '').localeCompare(b.email || '', 'en');
            return (b.score || 0) - (a.score || 0);
        });

    const startEdit = (u: any) => {
        setEditingId(u.id);
        setUsername(u.username || '');
        setEmail(u.email || '');
        setPassword(u.password || '');
        setRole(u.role || 'user');
        setMessage('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId || user?.role !== 'admin') return;
        setMessage('');

        const res = await fetch(`http://127.0.0.1:8000/api/users/${editingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': 'admin',
            },
            body: JSON.stringify({ username, email, password, role }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage('Почта и пароль пользователя обновлены');
            setEditingId(null);
            loadUsers();
        } else {
            setMessage(data.detail || 'Ошибка обновления');
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
                <DashboardTabs role={user?.role || 'guest'} />

                <div className="bg-slate-900/75 border border-cyan-500/35 p-6 rounded-2xl shadow-xl space-y-5">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <h1 className="text-xl font-bold text-white">Пользователи и статистика</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="text"
                                placeholder="Поиск по имени или почте..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500"
                            />
                            <div className="flex items-center gap-1.5">
                                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as UserSort)}
                                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                                >
                                    <option value="username-asc">Имя: А → Я</option>
                                    <option value="username-desc">Имя: Я → А</option>
                                    <option value="email-asc">Почта: A → Z</option>
                                    <option value="score-desc">Статистика: больше очков</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 px-4 py-3 rounded-xl text-sm">
                            {message}
                        </div>
                    )}

                    {editingId && (
                        <form onSubmit={handleSave} className="bg-slate-950 border border-cyan-500/40 p-5 rounded-xl space-y-4 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-cyan-300">Редактор аккаунта #{editingId}</span>
                                <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white underline">
                                    Отмена
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 mb-1">Имя</label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Почта (Email)</label>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Пароль</label>
                                    <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Роль</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none">
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5">
                                <Save className="w-4 h-4" />
                                <span>Сохранить почту и пароль</span>
                            </button>
                        </form>
                    )}

                    <div className="space-y-3">
                        {filteredAndSorted.map((u) => (
                            <div key={u.id} className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm">{u.username}</span>
                                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                                            {u.role}
                                        </span>
                                    </div>
                                    <div className="text-slate-400 font-mono flex flex-wrap gap-x-4 gap-y-1">
                                        <span>Почта: <strong className="text-cyan-300 font-normal">{u.email}</strong></span>
                                        <span>Пароль: <strong className="text-slate-200 font-normal">{u.password || '—'}</strong></span>
                                    </div>
                                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg px-3 py-1.5 font-mono text-[11px] text-amber-300 inline-flex gap-4">
                                        <span>Рекорд викторины: {u.score || 0}</span>
                                        <span>Изучено: {u.studied_count || 0}</span>
                                        <span>Избранное: {u.favorites_count || 0}</span>
                                    </div>
                                </div>

                                <button type="button" onClick={() => startEdit(u)} className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/70 px-4 py-2 rounded-xl font-semibold transition shrink-0 self-end sm:self-center">
                                    Изменить почту и пароль
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}