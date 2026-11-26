'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Plus, Link2, Trash2, Save, Sparkles } from 'lucide-react';

export default function AdminStarsPage() {
    const searchParams = useSearchParams();
    const initialId = searchParams.get('id');

    const [user, setUser] = useState<any>(null);
    const [constellations, setConstellations] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>('new');

    const [name, setName] = useState('');
    const [latin, setLatin] = useState('');
    const [description, setDescription] = useState('');
    const [season, setSeason] = useState('Зима');
    const [stars, setStars] = useState<any[]>([]);
    const [lines, setLines] = useState<[number, number][]>([]);
    const [connectFromIdx, setConnectFromIdx] = useState<number | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
        loadConstellations();
    }, []);

    const loadConstellations = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/constellations');
            const data = await res.json();
            setConstellations(data);

            if (initialId) {
                const found = data.find((c: any) => String(c.id) === String(initialId));
                if (found) {
                    applyConstellation(found);
                    return;
                }
            }
        } catch { }
    };

    const applyConstellation = (c: any) => {
        setSelectedId(String(c.id));
        setName(c.name || '');
        setLatin(c.latin || '');
        setDescription(c.description || '');
        setSeason(c.season || 'Зима');
        setStars(c.stars || []);
        setLines(c.lines || []);
        setConnectFromIdx(null);
        setStatusMsg('');
    };

    const resetForNew = () => {
        setSelectedId('new');
        setName('');
        setLatin('');
        setDescription('');
        setSeason('Зима');
        setStars([]);
        setLines([]);
        setConnectFromIdx(null);
        setStatusMsg('');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

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

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        lines.forEach(([i, j]) => {
            if (stars[i] && stars[j]) {
                ctx.beginPath();
                ctx.moveTo(w / 2 + stars[i].x, h / 2 + stars[i].y);
                ctx.lineTo(w / 2 + stars[j].x, h / 2 + stars[j].y);
                ctx.stroke();
            }
        });

        stars.forEach((star, idx) => {
            const sx = w / 2 + star.x;
            const sy = h / 2 + star.y;

            if (connectFromIdx === idx) {
                ctx.beginPath();
                ctx.arc(sx, sy, 13, 0, Math.PI * 2);
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`${idx + 1}. ${star.name}`, sx + 9, sy + 4);
        });
    }, [stars, lines, connectFromIdx]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.round(((e.clientX - rect.left) * (canvas.width / rect.width)) - canvas.width / 2);
        const clickY = Math.round(((e.clientY - rect.top) * (canvas.height / rect.height)) - canvas.height / 2);

        setStars([
            ...stars,
            {
                name: `Звезда ${stars.length + 1}`,
                x: clickX,
                y: clickY,
                size: 5.5,
                color: '#38bdf8',
                type: 'Главная последовательность',
                distance: '150 св. лет',
            },
        ]);
    };

    const handleConnectStar = (idx: number) => {
        if (connectFromIdx === null) {
            setConnectFromIdx(idx);
        } else if (connectFromIdx === idx) {
            setConnectFromIdx(null);
        } else {
            const exists = lines.some(([a, b]) => (a === connectFromIdx && b === idx) || (a === idx && b === connectFromIdx));
            if (!exists) setLines([...lines, [connectFromIdx, idx]]);
            setConnectFromIdx(null);
        }
    };

    const removeStar = (idx: number) => {
        setStars(stars.filter((_, i) => i !== idx));
        setLines(
            lines
                .filter(([a, b]) => a !== idx && b !== idx)
                .map(([a, b]): [number, number] => [a > idx ? a - 1 : a, b > idx ? b - 1 : b])
        );
        setConnectFromIdx(null);
    };

    const updateStarField = (idx: number, field: string, value: string) => {
        const next = [...stars];
        next[idx] = { ...next[idx], [field]: value };
        setStars(next);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.role !== 'admin') return;
        setStatusMsg('');

        const isEdit = selectedId !== 'new';
        const url = isEdit
            ? `http://127.0.0.1:8000/api/constellations/${selectedId}`
            : 'http://127.0.0.1:8000/api/constellations';

        try {
            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': 'admin',
                },
                body: JSON.stringify({
                    name,
                    latin,
                    description: description || `Созвездие ${name}`,
                    season,
                    stars,
                    lines,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatusMsg(isEdit ? 'Звёзды и схема созвездия сохранены' : 'Новое созвездие со звёздами создано');
                await loadConstellations();
                if (!isEdit && data.item?.id) {
                    setSelectedId(String(data.item.id));
                }
            } else {
                setStatusMsg(data.detail || 'Ошибка сохранения');
            }
        } catch {
            setStatusMsg('Ошибка соединения с сервером');
        }
    };

    if (user && user.role !== 'admin') {
        return (
            <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <h1 className="text-2xl font-bold text-white">Доступ только для администратора</h1>
                    <Link href="/dashboard" className="bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm">
                        Вернуться в кабинет
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
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
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <span>Конструктор звёзд и карты созвездий</span>
                            </h1>
                            <p className="text-xs text-slate-400">Отдельная страница создания и редактирования звёздных схем</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedId}
                            onChange={(e) => {
                                if (e.target.value === 'new') {
                                    resetForNew();
                                } else {
                                    const found = constellations.find((c) => String(c.id) === e.target.value);
                                    if (found) applyConstellation(found);
                                }
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                        >
                            <option value="new">+ Новое созвездие</option>
                            {constellations.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name} ({c.latin})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={resetForNew}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Создать новое</span>
                        </button>
                    </div>
                </div>

                {statusMsg && (
                    <div className="bg-purple-500/20 border border-purple-500/40 text-purple-200 px-4 py-3 rounded-xl text-sm">
                        {statusMsg}
                    </div>
                )}

                <form onSubmit={handleSave} className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Название созвездия"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        />
                        <input
                            type="text"
                            placeholder="Латинское название"
                            required
                            value={latin}
                            onChange={(e) => setLatin(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        />
                        <select
                            value={season}
                            onChange={(e) => setSeason(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        >
                            <option value="Зима">Сезон: Зима</option>
                            <option value="Весна">Сезон: Весна</option>
                            <option value="Лето">Сезон: Лето</option>
                            <option value="Осень">Сезон: Осень</option>
                        </select>
                    </div>

                    <textarea
                        placeholder="Краткое описание созвездия..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                    />

                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Кликайте по холсту для постановки звёзд • Соединяйте их кнопкой «Линия»
                        </span>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setLines([])} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
                                Очистить линии
                            </button>
                            <button type="button" onClick={() => { setStars([]); setLines([]); }} className="text-xs bg-red-950/60 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-lg">
                                Удалить все звёзды
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                        <canvas
                            ref={canvasRef}
                            width={520}
                            height={360}
                            onClick={handleCanvasClick}
                            className="w-full h-[360px] rounded-xl border border-slate-700 cursor-crosshair block"
                        />

                        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                            {stars.length === 0 ? (
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-10 text-center text-xs text-slate-500">
                                    Нажмите на чёрное поле слева, чтобы добавить первую звезду
                                </div>
                            ) : (
                                stars.map((star, idx) => (
                                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                                            <input
                                                type="text"
                                                value={star.name}
                                                onChange={(e) => updateStarField(idx, 'name', e.target.value)}
                                                placeholder="Название звезды"
                                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleConnectStar(idx)}
                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${connectFromIdx === idx ? 'bg-amber-500 text-slate-950' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                                    }`}
                                            >
                                                <Link2 className="w-3.5 h-3.5" />
                                                <span>{connectFromIdx === idx ? '2-я звезда' : 'Линия'}</span>
                                            </button>
                                            <button type="button" onClick={() => removeStar(idx)} className="text-red-400 hover:text-red-300 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={star.type || ''}
                                                onChange={(e) => updateStarField(idx, 'type', e.target.value)}
                                                placeholder="Тип звезды"
                                                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                                            />
                                            <input
                                                type="text"
                                                value={star.distance || ''}
                                                onChange={(e) => updateStarField(idx, 'distance', e.target.value)}
                                                placeholder="Расстояние (св. лет)"
                                                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>Сохранить созвездие и звёзды</span>
                    </button>
                </form>
            </div>
        </main>
    );
}