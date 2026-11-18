'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Списки данных
    const [constellations, setConstellations] = useState<any[]>([]);
    const [quizList, setQuizList] = useState<any[]>([]);

    // Состояния формы созвездия и конструктора карты
    const [editingCId, setEditingCId] = useState<number | null>(null);
    const [cName, setCName] = useState('');
    const [cLatin, setCLatin] = useState('');
    const [cDesc, setCDesc] = useState('');
    const [cSeason, setCSeason] = useState('Зима');
    const [cStars, setCStars] = useState<any[]>([]);
    const [cLines, setCLines] = useState<[number, number][]>([]);
    const [connectFromIdx, setConnectFromIdx] = useState<number | null>(null);
    const [cMessage, setCMessage] = useState('');

    // Холст конструктора карты
    const builderCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Состояния формы викторины
    const [editingQId, setEditingQId] = useState<number | null>(null);
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
        fetchQuiz();
    }, []);

    const fetchConstellations = () => {
        fetch('http://127.0.0.1:8000/api/constellations')
            .then((res) => res.json())
            .then((data) => setConstellations(data))
            .catch((err) => console.error('Ошибка загрузки созвездий:', err));
    };

    const fetchQuiz = () => {
        fetch('http://127.0.0.1:8000/api/quiz')
            .then((res) => res.json())
            .then((data) => setQuizList(data))
            .catch((err) => console.error('Ошибка загрузки викторины:', err));
    };

    // Отрисовка мини-карты конструктора в реальном времени
    useEffect(() => {
        const canvas = builderCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Фон и сетка
        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Оси центра (0, 0)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

        // Линии между звёздами
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        cLines.forEach(([i, j]) => {
            if (cStars[i] && cStars[j]) {
                ctx.beginPath();
                ctx.moveTo(w / 2 + cStars[i].x, h / 2 + cStars[i].y);
                ctx.lineTo(w / 2 + cStars[j].x, h / 2 + cStars[j].y);
                ctx.stroke();
            }
        });

        // Звёзды
        cStars.forEach((star, idx) => {
            const sx = w / 2 + star.x;
            const sy = h / 2 + star.y;

            if (connectFromIdx === idx) {
                ctx.beginPath();
                ctx.arc(sx, sy, 12, 0, Math.PI * 2);
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(`${idx + 1}. ${star.name}`, sx + 8, sy + 4);
        });
    }, [cStars, cLines, connectFromIdx, user]);

    // Клик по холсту конструктора — добавление новой звезды
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = builderCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clickX = Math.round((e.clientX - rect.left) * scaleX - canvas.width / 2);
        const clickY = Math.round((e.clientY - rect.top) * scaleY - canvas.height / 2);

        const newStar = {
            name: `Звезда ${cStars.length + 1}`,
            x: clickX,
            y: clickY,
            size: 5,
            color: '#38bdf8',
            type: 'Главная последовательность',
            distance: '150 св. лет',
        };
        setCStars([...cStars, newStar]);
    };

    const handleConnectStar = (idx: number) => {
        if (connectFromIdx === null) {
            setConnectFromIdx(idx);
        } else if (connectFromIdx === idx) {
            setConnectFromIdx(null);
        } else {
            // Проверяем, нет ли уже такой линии
            const exists = cLines.some(
                ([a, b]) => (a === connectFromIdx && b === idx) || (a === idx && b === connectFromIdx)
            );
            if (!exists) {
                setCLines([...cLines, [connectFromIdx, idx]]);
            }
            setConnectFromIdx(null);
        }
    };

    const removeStar = (idx: number) => {
        const updatedStars = cStars.filter((_, i) => i !== idx);
        // Пересчитываем индексы линий
        const updatedLines = cLines
            .filter(([a, b]) => a !== idx && b !== idx)
            .map(([a, b]): [number, number] => [a > idx ? a - 1 : a, b > idx ? b - 1 : b]);
        setCStars(updatedStars);
        setCLines(updatedLines);
        setConnectFromIdx(null);
    };

    const updateStarField = (idx: number, field: string, value: string) => {
        const updated = [...cStars];
        updated[idx] = { ...updated[idx], [field]: value };
        setCStars(updated);
    };

    // Сохранение созвездия вместе с картой
    const handleSaveConstellation = async (e: React.FormEvent) => {
        e.preventDefault();
        setCMessage('');

        const url = editingCId
            ? `http://127.0.0.1:8000/api/constellations/${editingCId}`
            : 'http://127.0.0.1:8000/api/constellations';
        const method = editingCId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: cName,
                    latin: cLatin,
                    description: cDesc,
                    season: cSeason,
                    stars: cStars,
                    lines: cLines,
                }),
            });
            if (res.ok) {
                setCMessage(editingCId ? '✏️ Созвездие и карта успешно обновлены!' : '✨ Новое созвездие добавлено в энциклопедию и на карту!');
                cancelEditConstellation();
                fetchConstellations();
            } else {
                setCMessage('Ошибка при сохранении созвездия');
            }
        } catch (err) {
            setCMessage('Ошибка соединения с сервером');
        }
    };

    const startEditConstellation = (item: any) => {
        setEditingCId(item.id);
        setCName(item.name);
        setCLatin(item.latin);
        setCDesc(item.description);
        setCSeason(item.season || 'Зима');
        setCStars(item.stars || []);
        setCLines(item.lines || []);
        setConnectFromIdx(null);
        setCMessage('');
    };

    const cancelEditConstellation = () => {
        setEditingCId(null);
        setCName('');
        setCLatin('');
        setCDesc('');
        setCSeason('Зима');
        setCStars([]);
        setCLines([]);
        setConnectFromIdx(null);
    };

    const handleDeleteConstellation = async (id: number) => {
        if (!confirm('Удалить это созвездие с карты и из энциклопедии?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/constellations/${id}`, { method: 'DELETE' });
            if (res.ok) fetchConstellations();
        } catch (err) {
            alert('Ошибка соединения');
        }
    };

    // --- Управление Викториной ---
    const handleSaveQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        setQMessage('');

        const url = editingQId
            ? `http://127.0.0.1:8000/api/quiz/${editingQId}`
            : 'http://127.0.0.1:8000/api/quiz';
        const method = editingQId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: qText,
                    options: [qOpt1, qOpt2, qOpt3],
                    answer: qAnswer,
                }),
            });
            if (res.ok) {
                setQMessage(editingQId ? '✏️ Вопрос викторины обновлен!' : '🚀 Новый вопрос добавлен в викторину!');
                cancelEditQuiz();
                fetchQuiz();
            } else {
                setQMessage('Ошибка при сохранении вопроса');
            }
        } catch (err) {
            setQMessage('Ошибка соединения с сервером');
        }
    };

    const startEditQuiz = (q: any) => {
        setEditingQId(q.id);
        setQText(q.question);
        setQOpt1(q.options?.[0] || '');
        setQOpt2(q.options?.[1] || '');
        setQOpt3(q.options?.[2] || '');
        setQAnswer(q.answer);
        setQMessage('');
    };

    const cancelEditQuiz = () => {
        setEditingQId(null);
        setQText('');
        setQOpt1('');
        setQOpt2('');
        setQOpt3('');
        setQAnswer('');
    };

    const handleDeleteQuiz = async (id: number) => {
        if (!confirm('Удалить этот вопрос из викторины?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/quiz/${id}`, { method: 'DELETE' });
            if (res.ok) fetchQuiz();
        } catch (err) {
            alert('Ошибка соединения');
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#030712] text-cyan-400 flex items-center justify-center font-mono">Загрузка дашборда...</div>;
    }

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
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

                {/* ПАНЕЛЬ АДМИНИСТРАТОРА */}
                {user.role === 'admin' && (
                    <div className="space-y-8 mb-8">

                        {/* БЛОК 1: ЭНЦИКЛОПЕДИЯ И ВИЗУАЛЬНЫЙ РЕДАКТОР КАРТЫ */}
                        <div className="bg-slate-900/70 border border-purple-500/40 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-purple-400 mb-4">👑 Управление Энциклопедией и Картой неба</h2>

                            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-cyan-300">
                                        {editingCId ? `✏️ Редактирование объекта (ID: ${editingCId})` : '➕ Создать созвездие и нарисовать его на карте'}
                                    </h3>
                                    {editingCId && (
                                        <button onClick={cancelEditConstellation} className="text-xs text-slate-400 hover:text-white underline">
                                            Отменить редактирование
                                        </button>
                                    )}
                                </div>

                                {cMessage && <div className="text-sm bg-purple-500/20 border border-purple-500/40 p-3 rounded-lg mb-4 text-purple-300">{cMessage}</div>}

                                <form onSubmit={handleSaveConstellation} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <input
                                            type="text" placeholder="Название (например: Лира)" required value={cName} onChange={(e) => setCName(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                        <input
                                            type="text" placeholder="Латинское имя (Lyra)" required value={cLatin} onChange={(e) => setCLatin(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                        <select
                                            value={cSeason} onChange={(e) => setCSeason(e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                        >
                                            <option value="Зима">Сезон: Зима</option>
                                            <option value="Весна">Сезон: Весна</option>
                                            <option value="Лето">Сезон: Лето</option>
                                            <option value="Осень">Сезон: Осень</option>
                                        </select>
                                    </div>

                                    <textarea
                                        placeholder="Описание созвездия..." required value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={2}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
                                    />

                                    {/* ИНТЕРАКТИВНЫЙ КОНСТРУКТОР КАРТЫ */}
                                    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
                                        <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                                🌌 Конструктор схемы на карте (Кликните по полю, чтобы поставить звезду)
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCLines([])}
                                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg"
                                                >
                                                    Очистить линии
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setCStars([]); setCLines([]); }}
                                                    className="text-xs bg-red-950/60 hover:bg-red-900 text-red-400 px-2.5 py-1 rounded-lg"
                                                >
                                                    Сбросить все звёзды
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                            <canvas
                                                ref={builderCanvasRef}
                                                width={440}
                                                height={300}
                                                onClick={handleCanvasClick}
                                                className="w-full h-[300px] rounded-xl border border-slate-700 cursor-crosshair block"
                                            />

                                            {/* Список расставленных звёзд */}
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                                {cStars.length === 0 ? (
                                                    <p className="text-xs text-slate-500 py-8 text-center">
                                                        Нажмите на холст слева, чтобы добавить звёзды созвездия
                                                    </p>
                                                ) : (
                                                    cStars.map((star, idx) => (
                                                        <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-2 text-xs">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                                                                <input
                                                                    type="text"
                                                                    value={star.name}
                                                                    onChange={(e) => updateStarField(idx, 'name', e.target.value)}
                                                                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                                                                    placeholder="Имя звезды"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleConnectStar(idx)}
                                                                    className={`px-2 py-1 rounded font-semibold transition ${connectFromIdx === idx
                                                                        ? 'bg-amber-500 text-slate-950'
                                                                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                                                        }`}
                                                                >
                                                                    {connectFromIdx === idx ? 'Выберите 2-ю...' : '🔗 Линия'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeStar(idx)}
                                                                    className="text-red-400 hover:text-red-300 px-1.5"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={star.type || ''}
                                                                    onChange={(e) => updateStarField(idx, 'type', e.target.value)}
                                                                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                                                                    placeholder="Тип (Голубой гигант...)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={star.distance || ''}
                                                                    onChange={(e) => updateStarField(idx, 'distance', e.target.value)}
                                                                    className="w-28 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                                                                    placeholder="Расстояние"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-purple-600/25">
                                        {editingCId ? '💾 Сохранить изменения созвездия и карты' : '✨ Добавить созвездие на сайт и карту'}
                                    </button>
                                </form>
                            </div>

                            {/* Список всех созвездий для редактирования/удаления */}
                            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl">
                                <h3 className="text-base font-semibold text-slate-200 mb-3">📚 Созвездия в базе ({constellations.length})</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {constellations.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                            <div>
                                                <span className="font-bold text-white text-sm">{item.name}</span>
                                                <span className="text-xs text-slate-400 ml-2 font-mono">({item.latin}) • Звёзд: {item.stars?.length || 0}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditConstellation(item)} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg text-xs transition">
                                                    Редактировать / Карта
                                                </button>
                                                <button onClick={() => handleDeleteConstellation(item.id)} className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-xs transition">
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* БЛОК 2: УПРАВЛЕНИЕ ВИКТОРИНОЙ (ДОБАВЛЕНИЕ, РЕДАКТИРОВАНИЕ И УДАЛЕНИЕ) */}
                        <div className="bg-slate-900/70 border border-amber-500/40 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-amber-400 mb-4">🚀 Управление Викториной</h2>

                            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-amber-300">
                                        {editingQId ? `✏️ Редактирование вопроса (ID: ${editingQId})` : '➕ Добавить новый вопрос'}
                                    </h3>
                                    {editingQId && (
                                        <button onClick={cancelEditQuiz} className="text-xs text-slate-400 hover:text-white underline">
                                            Отменить редактирование
                                        </button>
                                    )}
                                </div>

                                {qMessage && <div className="text-sm bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg mb-4 text-amber-300">{qMessage}</div>}

                                <form onSubmit={handleSaveQuiz} className="space-y-3">
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
                                            type="text" placeholder="Правильный ответ (должен совпадать с одним из вариантов)" required value={qAnswer} onChange={(e) => setQAnswer(e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-600/25">
                                            {editingQId ? 'Сохранить вопрос' : 'Добавить вопрос'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Список всех вопросов викторины */}
                            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl">
                                <h3 className="text-base font-semibold text-slate-200 mb-3">📋 Вопросы викторины в базе ({quizList.length})</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {quizList.map((q) => (
                                        <div key={q.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl gap-4">
                                            <div className="flex-1">
                                                <p className="font-semibold text-white text-sm">{q.question}</p>
                                                <p className="text-xs text-emerald-400 font-mono mt-1">Ответ: {q.answer}</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => startEditQuiz(q)} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg text-xs transition">
                                                    Редактировать
                                                </button>
                                                <button onClick={() => handleDeleteQuiz(q.id)} className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-xs transition">
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Блок обычного пользователя */}
                {user.role === 'user' && (
                    <div className="bg-slate-900/60 border border-cyan-500/40 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">🔭 Кабинет Исследователя</h2>
                        <p className="text-slate-300 text-sm">Вы вошли как зарегистрированный пользователь. Исследуйте карту звёздного неба и проходите викторину!</p>
                    </div>
                )}

                {/* Блок гостя */}
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