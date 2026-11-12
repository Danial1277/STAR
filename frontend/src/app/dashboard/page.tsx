'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Списки для админки
    const [constellations, setConstellations] = useState<any[]>([]);

    // Состояния формы созвездия (Создание / Редактирование)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [cName, setCName] = useState('');
    const [cLatin, setCLatin] = useState('');
    const [cDesc, setCDesc] = useState('');
    const [cSeason, setCSeason] = useState('Зима');
    const [cMessage, setCMessage] = useState('');

    // Форма викторины
    const [qText, setQText] = useState('');
    const [qOpt1, setQOpt1] = useState('');
    const [qOpt2, setQOpt2] = useState('');
    const [qOpt3, setQOpt3] = useState('');
    const [qAnswer, setQAnswer] = useState('');
    const [qMessage, setQMessage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest' });
        }
        setIsLoaded(true);
        fetchConstellations();
    }, []);

    const fetchConstellations = () => {
        fetch('http://127.0.0.1:8000/api/constellations')
            .then((res) => res.json())
            .then((data) => setConstellations(data))
            .catch((err) => console.error('Ошибка загрузки созвездий:', err));
    };

    const handleSaveConstellation = async (e: React.FormEvent) => {
        e.preventDefault();
        setCMessage('');

        const url = editingId
            ? `http://127.0.0.1:8000/api/constellations/${editingId}`
            : 'http://127.0.0.1:8000/api/constellations';

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: cName, latin: cLatin, description: cDesc, season: cSeason })
            });
            if (res.ok) {
                setCMessage(editingId ? '✏️ Созвездие успешно обновлено!' : '✨ Созвездие успешно добавлено!');
                cancelEdit();
                fetchConstellations();
            } else {
                setCMessage('Ошибка при сохранении');
            }
        } catch (err) {
            setCMessage('Ошибка соединения с сервером');
        }
    };

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setCName(item.name);
        setCLatin(item.latin);
        setCDesc(item.description);
        setCSeason(item.season || 'Зима');
        setCMessage('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCName('');
        setCLatin('');
        setCDesc('');
        setCSeason('Зима');
    };

    const handleDeleteConstellation = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить это созвездие?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/constellations/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchConstellations();
            } else {
                alert('Не удалось удалить созвездие');
            }
        } catch (err) {
            alert('Ошибка соединения с сервером');
        }
    };

    const handleAddQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        setQMessage('');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: qText,
                    options: [qOpt1, qOpt2, qOpt3],
                    answer: qAnswer
                })
            });
            if (res.ok) {
                setQMessage('🚀 Вопрос успешно добавлен в викторину!');
                setQText(''); setQOpt1(''); setQOpt2(''); setQOpt3(''); setQAnswer('');
            } else {
                setQMessage('Ошибка при добавлении вопроса');
            }
        } catch (err) {
            setQMessage('Ошибка соединения с сервером');
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#030712] text-cyan-400 flex items-center justify-center font-mono">Загрузка дашборда...</div>;
    }

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 p-6 md:p-10 flex flex-col items-center">
            <div className="max-w-4xl w-full">

                {/* Шапка профиля */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl mb-8 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Панель управления (Дашборд)</h1>
                        <p className="text-slate-400 text-sm">
                            Профиль: <span className="text-cyan-400 font-semibold">{user.username}</span> ({user.email})
                        </p>
                    </div>

                    <span className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-950 text-purple-400 border-purple-700' :
                        user.role === 'user' ? 'bg-cyan-950 text-cyan-400 border-cyan-700' :
                            'bg-slate-800 text-slate-300 border-slate-600'
                        }`}>
                        Статус: {user.role === 'admin' ? 'Администратор' : user.role === 'user' ? 'Пользователь' : 'Гость'}
                    </span>
                </div>

                {/* 1. БЛОК АДМИНИСТРАТОРА */}
                {user.role === 'admin' && (
                    <div className="space-y-6 mb-8">
                        <div className="bg-slate-900/60 border border-purple-500/40 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-purple-400 mb-2">👑 Панель редактора контента</h2>
                            <p className="text-slate-300 text-sm mb-6">
                                Управление базой энциклопедии созвездий и викториной.
                            </p>

                            {/* Форма добавления/редактирования созвездия */}
                            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-cyan-300">
                                        {editingId ? `✏️ Редактирование созвездия (ID: ${editingId})` : '📖 Добавить созвездие в Энциклопедию'}
                                    </h3>
                                    {editingId && (
                                        <button onClick={cancelEdit} className="text-xs text-slate-400 hover:text-white underline">
                                            Отменить редактирование
                                        </button>
                                    )}
                                </div>

                                {cMessage && <div className="text-sm bg-purple-500/20 border border-purple-500/40 p-3 rounded-lg mb-3 text-purple-300">{cMessage}</div>}

                                <form onSubmit={handleSaveConstellation} className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text" placeholder="Название (например: Лебедь)" required value={cName} onChange={(e) => setCName(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                        <input
                                            type="text" placeholder="Латинское имя (Cygnus)" required value={cLatin} onChange={(e) => setCLatin(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Описание созвездия..." required value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={3}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                    />
                                    <div className="flex gap-3 items-center justify-between">
                                        <select
                                            value={cSeason} onChange={(e) => setCSeason(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        >
                                            <option value="Зима">Зима</option>
                                            <option value="Весна">Весна</option>
                                            <option value="Лето">Лето</option>
                                            <option value="Осень">Осень</option>
                                        </select>
                                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-purple-600/25">
                                            {editingId ? 'Сохранить изменения' : 'Добавить созвездие'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Список существующих созвездий для управления */}
                            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl mb-6">
                                <h3 className="text-base font-semibold text-slate-200 mb-4">📚 Существующие созвездия ({constellations.length})</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {constellations.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                            <div>
                                                <span className="font-bold text-white text-sm">{item.name}</span>
                                                <span className="text-xs text-slate-400 ml-2 font-mono">({item.latin})</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg text-xs transition"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteConstellation(item.id)}
                                                    className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-xs transition"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Форма добавления вопроса викторины */}
                            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl">
                                <h3 className="text-base font-semibold text-amber-300 mb-4">🚀 Добавить вопрос в Викторину</h3>
                                {qMessage && <div className="text-sm bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg mb-3 text-amber-300">{qMessage}</div>}
                                <form onSubmit={handleAddQuiz} className="space-y-3">
                                    <input
                                        type="text" placeholder="Текст вопроса..." required value={qText} onChange={(e) => setQText(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <input type="text" placeholder="Вариант 1" required value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                                        <input type="text" placeholder="Вариант 2" required value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                                        <input type="text" placeholder="Вариант 3" required value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none" />
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="text" placeholder="Правильный ответ" required value={qAnswer} onChange={(e) => setQAnswer(e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-600/25">
                                            Добавить вопрос
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                )}

                {/* 2. БЛОК ПОЛЬЗОВАТЕЛЯ */}
                {user.role === 'user' && (
                    <div className="bg-slate-900/60 border border-cyan-500/40 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">🔭 Кабинет Исследователя</h2>
                        <p className="text-slate-300 text-sm">Вы вошли как зарегистрированный пользователь.</p>
                    </div>
                )}

                {/* 3. БЛОК ГОСТЯ */}
                {user.role === 'guest' && (
                    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-200 mb-3">👀 Гостевой режим</h2>
                        <p className="text-slate-400 text-sm mb-4">Вы просматриваете систему без авторизации.</p>
                        <a href="/auth/login" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm inline-block">Войти</a>
                    </div>
                )}

                {/* Нижняя панель */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                    <a href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition">
                        ← На главную
                    </a>
                    {user.role !== 'guest' && (
                        <button
                            onClick={() => { localStorage.removeItem('user'); setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest' }); }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition"
                        >
                            Выйти
                        </button>
                    )}
                </div>

            </div>
        </main>
    );
}