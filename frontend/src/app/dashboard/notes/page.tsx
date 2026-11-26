'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardTabs from '@/components/DashboardTabs';
import { NotebookPen, Send } from 'lucide-react';

export default function UserNotesPage() {
    const [user, setUser] = useState<any>(null);
    const [notes, setNotes] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                if (parsed.email && parsed.email !== 'Не авторизован') {
                    loadNotes(parsed.email);
                }
            } catch { }
        }
    }, []);

    const loadNotes = (email: string) => {
        fetch(`http://127.0.0.1:8000/api/notes?email=${encodeURIComponent(email)}`)
            .then((res) => res.json())
            .then((data) => setNotes(data))
            .catch(() => { });
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !user || user.role === 'guest') return;
        setStatus('');

        const res = await fetch('http://127.0.0.1:8000/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, title, content }),
        });

        if (res.ok) {
            setTitle('');
            setContent('');
            setStatus('Заметка добавлена в дневник наблюдений');
            loadNotes(user.email);
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
                <DashboardTabs role={user?.role || 'guest'} />

                <div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2">
                        <NotebookPen className="w-5 h-5 text-purple-400" />
                        <h1 className="text-xl font-bold text-white">Дневник наблюдений</h1>
                    </div>

                    {status && (
                        <div className="text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200 p-3 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleAddNote} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Заголовок наблюдения"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        />
                        <textarea
                            placeholder="Ваши заметки о звёздном небе..."
                            rows={2}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Сохранить заметку</span>
                        </button>
                    </form>

                    <div className="space-y-2.5 pt-2">
                        {notes.map((n) => (
                            <div key={n.id} className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl">
                                <h2 className="font-bold text-white text-sm">{n.title}</h2>
                                <p className="text-xs text-slate-300 mt-1">{n.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}