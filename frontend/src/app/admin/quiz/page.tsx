'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, HelpCircle, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminQuizPage() {
    const [user, setUser] = useState<any>(null);
    const [quizList, setQuizList] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [question, setQuestion] = useState('');
    const [opt1, setOpt1] = useState('');
    const [opt2, setOpt2] = useState('');
    const [opt3, setOpt3] = useState('');
    const [answer, setAnswer] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        fetchQuiz();
    }, []);

    const fetchQuiz = () => {
        fetch('http://127.0.0.1:8000/api/quiz')
            .then((res) => res.json())
            .then((data) => setQuizList(data))
            .catch(() => { });
    };

    const resetForm = () => {
        setEditingId(null);
        setQuestion('');
        setOpt1('');
        setOpt2('');
        setOpt3('');
        setAnswer('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.role !== 'admin') return;
        setMsg('');

        const url = editingId ? `http://127.0.0.1:8000/api/quiz/${editingId}` : 'http://127.0.0.1:8000/api/quiz';
        try {
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': 'admin',
                },
                body: JSON.stringify({ question, options: [opt1, opt2, opt3], answer }),
            });
            if (res.ok) {
                setMsg(editingId ? 'Вопрос обновлён' : 'Новый вопрос добавлен в викторину');
                resetForm();
                fetchQuiz();
            } else {
                setMsg('Ошибка сохранения вопроса');
            }
        } catch {
            setMsg('Ошибка соединения с сервером');
        }
    };

    const startEdit = (q: any) => {
        setEditingId(q.id);
        setQuestion(q.question);
        setOpt1(q.options?.[0] || '');
        setOpt2(q.options?.[1] || '');
        setOpt3(q.options?.[2] || '');
        setAnswer(q.answer);
        setMsg('');
    };

    const handleDelete = async (id: number) => {
        if (user?.role !== 'admin') return;
        if (!confirm('Удалить этот вопрос?')) return;
        const res = await fetch(`http://127.0.0.1:8000/api/quiz/${id}`, {
            method: 'DELETE',
            headers: { 'X-User-Role': 'admin' },
        });
        if (res.ok) fetchQuiz();
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/85 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>В дашборд</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-amber-400" />
                                <span>Редактор вопросов викторины</span>
                            </h1>
                            <p className="text-xs text-slate-400">Отдельная страница создания, редактирования и удаления вопросов</p>
                        </div>
                    </div>
                </div>

                {msg && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-xl text-sm">
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-slate-900/75 border border-amber-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold text-amber-300">
                            {editingId ? `Редактирование вопроса #${editingId}` : 'Добавить вопрос'}
                        </h2>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white underline">
                                Отменить
                            </button>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Текст вопроса"
                        required
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" placeholder="Вариант 1" required value={opt1} onChange={(e) => setOpt1(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                        <input type="text" placeholder="Вариант 2" required value={opt2} onChange={(e) => setOpt2(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                        <input type="text" placeholder="Вариант 3" required value={opt3} onChange={(e) => setOpt3(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Правильный ответ (должен совпадать с одним из вариантов)"
                            required
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                        />
                        <button
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{editingId ? 'Сохранить' : 'Добавить вопрос'}</span>
                        </button>
                    </div>
                </form>

                <div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
                    <h2 className="text-base font-bold text-white">Вопросы в базе ({quizList.length})</h2>
                    <div className="space-y-2.5">
                        {quizList.map((q) => (
                            <div key={q.id} className="flex items-center justify-between p-4 bg-slate-950/90 border border-slate-800 rounded-xl gap-4">
                                <div>
                                    <p className="font-semibold text-white text-sm">{q.question}</p>
                                    <p className="text-xs text-emerald-400 font-mono mt-1">Ответ: {q.answer}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startEdit(q)} className="flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1.5 rounded-lg text-xs">
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>Изменить</span>
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1.5 rounded-lg text-xs">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Удалить</span>
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