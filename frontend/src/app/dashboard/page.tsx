'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
	Shield,
	User,
	Eye,
	LogOut,
	Heart,
	CheckCircle2,
	Award,
	NotebookPen,
	Send,
	Plus,
	Pencil,
	Trash2,
	Link2,
	Sparkles,
	HelpCircle,
} from 'lucide-react';

type AdminTab = 'stars' | 'quiz';

export default function DashboardPage() {
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	// Внутренние вкладки админ-дашборда
	const [adminTab, setAdminTab] = useState<AdminTab>('stars');

	// Общие данные
	const [constellations, setConstellations] = useState<any[]>([]);
	const [quizList, setQuizList] = useState<any[]>([]);

	// Прогресс и дневник пользователя
	const [favorites, setFavorites] = useState<number[]>([]);
	const [studied, setStudied] = useState<number[]>([]);
	const [notes, setNotes] = useState<any[]>([]);
	const [noteTitle, setNoteTitle] = useState('');
	const [noteContent, setNoteContent] = useState('');
	const [noteStatus, setNoteStatus] = useState('');

	// Вкладка 1: Созвездия и конструктор карты
	const [editingCId, setEditingCId] = useState<number | null>(null);
	const [cName, setCName] = useState('');
	const [cLatin, setCLatin] = useState('');
	const [cDesc, setCDesc] = useState('');
	const [cSeason, setCSeason] = useState('Зима');
	const [cStars, setCStars] = useState<any[]>([]);
	const [cLines, setCLines] = useState<[number, number][]>([]);
	const [connectFromIdx, setConnectFromIdx] = useState<number | null>(null);
	const [cMessage, setCMessage] = useState('');
	const builderCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// Вкладка 2: Викторина
	const [editingQId, setEditingQId] = useState<number | null>(null);
	const [qText, setQText] = useState('');
	const [qOpt1, setQOpt1] = useState('');
	const [qOpt2, setQOpt2] = useState('');
	const [qOpt3, setQOpt3] = useState('');
	const [qAnswer, setQAnswer] = useState('');
	const [qMessage, setQMessage] = useState('');

	useEffect(() => {
		const stored = localStorage.getItem('user');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setUser(parsed);
				setFavorites(parsed.favorites || []);
				setStudied(parsed.studied || []);
				if (parsed.email && parsed.email !== 'Не авторизован') {
					fetchNotes(parsed.email);
				}
			} catch {
				setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
			}
		} else {
			setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
		}

		fetchConstellations();
		fetchQuiz();
		setIsLoaded(true);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('user');
		setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
		router.push('/');
	};

	const fetchConstellations = () => {
		fetch('http://127.0.0.1:8000/api/constellations')
			.then((res) => res.json())
			.then((data) => setConstellations(data))
			.catch(() => { });
	};

	const fetchQuiz = () => {
		fetch('http://127.0.0.1:8000/api/quiz')
			.then((res) => res.json())
			.then((data) => setQuizList(data))
			.catch(() => { });
	};

	const fetchNotes = (email: string) => {
		fetch(`http://127.0.0.1:8000/api/notes?email=${encodeURIComponent(email)}`)
			.then((res) => res.json())
			.then((data) => setNotes(data))
			.catch(() => { });
	};

	// --- Пользовательский прогресс ---
	const syncProgress = async (nextFavs: number[], nextStudied: number[]) => {
		setFavorites(nextFavs);
		setStudied(nextStudied);
		if (!user || user.role !== 'user') return;

		const updatedUser = { ...user, favorites: nextFavs, studied: nextStudied };
		setUser(updatedUser);
		localStorage.setItem('user', JSON.stringify(updatedUser));

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

	const handleAddNote = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!noteTitle.trim() || !noteContent.trim() || !user || user.role === 'guest') return;
		setNoteStatus('');
		try {
			const res = await fetch('http://127.0.0.1:8000/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: user.email, title: noteTitle, content: noteContent }),
			});
			if (res.ok) {
				setNoteTitle('');
				setNoteContent('');
				setNoteStatus('Запись добавлена в дневник наблюдений');
				fetchNotes(user.email);
			}
		} catch {
			setNoteStatus('Не удалось сохранить заметку');
		}
	};

	// --- Вкладка «Звёзды и карта» (Админ) ---
	useEffect(() => {
		const canvas = builderCanvasRef.current;
		if (!canvas || user?.role !== 'admin' || adminTab !== 'stars') return;
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
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}
		for (let y = 0; y <= h; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}

		ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, h / 2);
		ctx.lineTo(w, h / 2);
		ctx.stroke();

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
	}, [cStars, cLines, connectFromIdx, user, adminTab]);

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (user?.role !== 'admin') return;
		const canvas = builderCanvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const clickX = Math.round(((e.clientX - rect.left) * (canvas.width / rect.width)) - canvas.width / 2);
		const clickY = Math.round(((e.clientY - rect.top) * (canvas.height / rect.height)) - canvas.height / 2);

		setCStars([
			...cStars,
			{
				name: `Звезда ${cStars.length + 1}`,
				x: clickX,
				y: clickY,
				size: 5,
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
			const exists = cLines.some(([a, b]) => (a === connectFromIdx && b === idx) || (a === idx && b === connectFromIdx));
			if (!exists) setCLines([...cLines, [connectFromIdx, idx]]);
			setConnectFromIdx(null);
		}
	};

	const removeStar = (idx: number) => {
		setCStars(cStars.filter((_, i) => i !== idx));
		setCLines(
			cLines
				.filter(([a, b]) => a !== idx && b !== idx)
				.map(([a, b]): [number, number] => [a > idx ? a - 1 : a, b > idx ? b - 1 : b])
		);
		setConnectFromIdx(null);
	};

	const updateStarField = (idx: number, field: string, value: string) => {
		const updated = [...cStars];
		updated[idx] = { ...updated[idx], [field]: value };
		setCStars(updated);
	};

	const handleSaveConstellation = async (e: React.FormEvent) => {
		e.preventDefault();
		if (user?.role !== 'admin') return;
		setCMessage('');

		const url = editingCId
			? `http://127.0.0.1:8000/api/constellations/${editingCId}`
			: 'http://127.0.0.1:8000/api/constellations';
		try {
			const res = await fetch(url, {
				method: editingCId ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-User-Role': user.role,
				},
				body: JSON.stringify({ name: cName, latin: cLatin, description: cDesc, season: cSeason, stars: cStars, lines: cLines }),
			});
			if (res.ok) {
				setCMessage(editingCId ? 'Созвездие и схема карты обновлены' : 'Созвездие добавлено в базу и на карту');
				cancelEditConstellation();
				fetchConstellations();
			} else {
				setCMessage('Ошибка доступа или сохранения созвездия');
			}
		} catch {
			setCMessage('Ошибка соединения с сервером');
		}
	};

	const startEditConstellation = (item: any) => {
		setAdminTab('stars');
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
		if (user?.role !== 'admin') return;
		if (!confirm('Удалить это созвездие?')) return;
		const res = await fetch(`http://127.0.0.1:8000/api/constellations/${id}`, {
			method: 'DELETE',
			headers: { 'X-User-Role': user.role },
		});
		if (res.ok) fetchConstellations();
	};

	// --- Вкладка «Викторина» (Админ) ---
	const handleSaveQuiz = async (e: React.FormEvent) => {
		e.preventDefault();
		if (user?.role !== 'admin') return;
		setQMessage('');

		const url = editingQId ? `http://127.0.0.1:8000/api/quiz/${editingQId}` : 'http://127.0.0.1:8000/api/quiz';
		try {
			const res = await fetch(url, {
				method: editingQId ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-User-Role': user.role,
				},
				body: JSON.stringify({ question: qText, options: [qOpt1, qOpt2, qOpt3], answer: qAnswer }),
			});
			if (res.ok) {
				setQMessage(editingQId ? 'Вопрос обновлён' : 'Вопрос добавлен в викторину');
				cancelEditQuiz();
				fetchQuiz();
			} else {
				setQMessage('Ошибка доступа или сохранения вопроса');
			}
		} catch {
			setQMessage('Ошибка соединения с сервером');
		}
	};

	const startEditQuiz = (q: any) => {
		setAdminTab('quiz');
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
		if (user?.role !== 'admin') return;
		if (!confirm('Удалить этот вопрос?')) return;
		const res = await fetch(`http://127.0.0.1:8000/api/quiz/${id}`, {
			method: 'DELETE',
			headers: { 'X-User-Role': user.role },
		});
		if (res.ok) fetchQuiz();
	};

	if (!isLoaded || !user) {
		return <div className="min-h-screen bg-[#030712] text-cyan-400 flex items-center justify-center font-mono">Загрузка кабинета...</div>;
	}

	const currentRole = user.role || 'guest';
	const points = studied.length * 15 + (user.score || 0);
	const rankTitle = points >= 90 ? 'Хранитель неба' : points >= 50 ? 'Астроном' : points >= 20 ? 'Наблюдатель' : 'Новичок';

	return (
		<main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
			<Navbar />

			<div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
				{/* Шапка профиля */}
				<div className="bg-slate-900/85 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
					<div>
						<h1 className="text-2xl font-bold text-white">Личный кабинет</h1>
						<p className="text-sm text-slate-400 mt-1">
							Аккаунт: <span className="text-cyan-400 font-semibold">{user.username}</span> ({user.email})
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2.5">
						<span
							className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border ${currentRole === 'admin'
								? 'bg-purple-950 text-purple-300 border-purple-700'
								: currentRole === 'user'
									? 'bg-cyan-950 text-cyan-300 border-cyan-700'
									: 'bg-slate-800 text-slate-300 border-slate-600'
								}`}
						>
							{currentRole === 'admin' && <Shield className="w-3.5 h-3.5" />}
							{currentRole === 'user' && <User className="w-3.5 h-3.5" />}
							{currentRole === 'guest' && <Eye className="w-3.5 h-3.5" />}
							<span>
								{currentRole === 'admin'
									? 'Администратор'
									: currentRole === 'user'
										? 'Пользователь'
										: 'Гость'}
							</span>
						</span>

						{currentRole !== 'guest' && (
							<button
								onClick={handleLogout}
								className="flex items-center gap-1.5 bg-red-950/50 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/60 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
							>
								<LogOut className="w-3.5 h-3.5" />
								<span>Выйти</span>
							</button>
						)}
					</div>
				</div>

				{/* 1. ВНУТРЕННИЙ АДМИН-ДАШБОРД С ВКЛАДКАМИ */}
				{currentRole === 'admin' && (
					<div className="space-y-6">
						<div className="bg-slate-900/85 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-2 text-sm font-bold text-purple-300">
								<Shield className="w-4 h-4 text-purple-400" />
								<span>Внутренний дашборд администратора</span>
							</div>

							{/* Переключатель внутренних вкладок */}
							<div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
								<button
									type="button"
									onClick={() => setAdminTab('stars')}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${adminTab === 'stars'
										? 'bg-purple-600 text-white shadow'
										: 'text-slate-400 hover:text-white'
										}`}
								>
									<Sparkles className="w-4 h-4" />
									<span>Звёзды и карта ({constellations.length})</span>
								</button>
								<button
									type="button"
									onClick={() => setAdminTab('quiz')}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${adminTab === 'quiz'
										? 'bg-amber-600 text-white shadow'
										: 'text-slate-400 hover:text-white'
										}`}
								>
									<HelpCircle className="w-4 h-4" />
									<span>Викторина ({quizList.length})</span>
								</button>
							</div>
						</div>

						{/* ВКЛАДКА АДМИНА: ЗВЁЗДЫ И КАРТА */}
						{adminTab === 'stars' && (
							<div className="bg-slate-900/75 border border-purple-500/40 p-6 rounded-2xl shadow-xl space-y-6">
								<h2 className="text-xl font-bold text-purple-400">Редактирование звёзд, созвездий и карты неба</h2>

								<div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-base font-semibold text-cyan-300">
											{editingCId ? `Редактирование созвездия (ID: ${editingCId})` : 'Новое созвездие и схема на карте'}
										</h3>
										{editingCId && (
											<button onClick={cancelEditConstellation} className="text-xs text-slate-400 hover:text-white underline">
												Отменить
											</button>
										)}
									</div>

									{cMessage && (
										<div className="text-sm bg-purple-500/20 border border-purple-500/40 p-3 rounded-lg mb-4 text-purple-300">
											{cMessage}
										</div>
									)}

									<form onSubmit={handleSaveConstellation} className="space-y-4">
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<input
												type="text"
												placeholder="Название"
												required
												value={cName}
												onChange={(e) => setCName(e.target.value)}
												className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
											/>
											<input
												type="text"
												placeholder="Латинское имя"
												required
												value={cLatin}
												onChange={(e) => setCLatin(e.target.value)}
												className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
											/>
											<select
												value={cSeason}
												onChange={(e) => setCSeason(e.target.value)}
												className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
											>
												<option value="Зима">Сезон: Зима</option>
												<option value="Весна">Сезон: Весна</option>
												<option value="Лето">Сезон: Лето</option>
												<option value="Осень">Сезон: Осень</option>
											</select>
										</div>

										<textarea
											placeholder="Описание созвездия..."
											required
											value={cDesc}
											onChange={(e) => setCDesc(e.target.value)}
											rows={2}
											className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500"
										/>

										<div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
											<div className="flex flex-wrap justify-between items-center mb-3 gap-2">
												<span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
													Конструктор схемы (клик по полю добавляет звезду)
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
														onClick={() => {
															setCStars([]);
															setCLines([]);
														}}
														className="text-xs bg-red-950/60 hover:bg-red-900 text-red-400 px-2.5 py-1 rounded-lg"
													>
														Сбросить звёзды
													</button>
												</div>
											</div>

											<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
												<canvas
													ref={builderCanvasRef}
													width={440}
													height={280}
													onClick={handleCanvasClick}
													className="w-full h-[280px] rounded-xl border border-slate-700 cursor-crosshair block"
												/>

												<div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
													{cStars.length === 0 ? (
														<p className="text-xs text-slate-500 py-8 text-center">
															Кликните по полю слева, чтобы поставить звёзды
														</p>
													) : (
														cStars.map((star, idx) => (
															<div
																key={idx}
																className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-2 text-xs"
															>
																<div className="flex items-center justify-between gap-2">
																	<span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
																	<input
																		type="text"
																		value={star.name}
																		onChange={(e) => updateStarField(idx, 'name', e.target.value)}
																		className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
																	/>
																	<button
																		type="button"
																		onClick={() => handleConnectStar(idx)}
																		className={`flex items-center gap-1 px-2 py-1 rounded font-semibold transition ${connectFromIdx === idx
																			? 'bg-amber-500 text-slate-950'
																			: 'bg-cyan-950 text-cyan-400 border border-cyan-800'
																			}`}
																	>
																		<Link2 className="w-3 h-3" />
																		<span>{connectFromIdx === idx ? 'Выбор 2-й' : 'Линия'}</span>
																	</button>
																	<button
																		type="button"
																		onClick={() => removeStar(idx)}
																		className="text-red-400 hover:text-red-300 px-1"
																	>
																		<Trash2 className="w-3.5 h-3.5" />
																	</button>
																</div>
															</div>
														))
													)}
												</div>
											</div>
										</div>

										<button
											type="submit"
											className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
										>
											<Plus className="w-4 h-4" />
											<span>{editingCId ? 'Сохранить изменения' : 'Добавить созвездие'}</span>
										</button>
									</form>
								</div>

								<div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl">
									<h3 className="text-base font-semibold text-slate-200 mb-3">
										Созвездия в базе ({constellations.length})
									</h3>
									<div className="space-y-2 max-h-64 overflow-y-auto pr-2">
										{constellations.map((item) => (
											<div
												key={item.id}
												className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl"
											>
												<div>
													<span className="font-bold text-white text-sm">{item.name}</span>
													<span className="text-xs text-slate-400 ml-2 font-mono">
														({item.latin}) • Звёзд: {item.stars?.length || 0}
													</span>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() => startEditConstellation(item)}
														className="flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg text-xs transition"
													>
														<Pencil className="w-3 h-3" />
														<span>Изменить</span>
													</button>
													<button
														onClick={() => handleDeleteConstellation(item.id)}
														className="flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-xs transition"
													>
														<Trash2 className="w-3 h-3" />
														<span>Удалить</span>
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* ВКЛАДКА АДМИНА: ВИКТОРИНА */}
						{adminTab === 'quiz' && (
							<div className="bg-slate-900/75 border border-amber-500/40 p-6 rounded-2xl shadow-xl space-y-6">
								<h2 className="text-xl font-bold text-amber-400">Редактирование вопросов викторины</h2>

								<form
									onSubmit={handleSaveQuiz}
									className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl space-y-3"
								>
									<div className="flex justify-between items-center">
										<h3 className="text-base font-semibold text-amber-300">
											{editingQId ? `Редактирование вопроса #${editingQId}` : 'Новый вопрос'}
										</h3>
										{editingQId && (
											<button type="button" onClick={cancelEditQuiz} className="text-xs text-slate-400 hover:text-white underline">
												Отменить
											</button>
										)}
									</div>
									{qMessage && (
										<div className="text-sm bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg text-amber-300">
											{qMessage}
										</div>
									)}
									<input
										type="text"
										placeholder="Текст вопроса"
										required
										value={qText}
										onChange={(e) => setQText(e.target.value)}
										className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
									/>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<input
											type="text"
											placeholder="Вариант 1"
											required
											value={qOpt1}
											onChange={(e) => setQOpt1(e.target.value)}
											className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none"
										/>
										<input
											type="text"
											placeholder="Вариант 2"
											required
											value={qOpt2}
											onChange={(e) => setQOpt2(e.target.value)}
											className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none"
										/>
										<input
											type="text"
											placeholder="Вариант 3"
											required
											value={qOpt3}
											onChange={(e) => setQOpt3(e.target.value)}
											className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm outline-none"
										/>
									</div>
									<div className="flex gap-3">
										<input
											type="text"
											placeholder="Правильный ответ"
											required
											value={qAnswer}
											onChange={(e) => setQAnswer(e.target.value)}
											className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
										/>
										<button
											type="submit"
											className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
										>
											{editingQId ? 'Сохранить' : 'Добавить'}
										</button>
									</div>
								</form>

								<div className="bg-slate-950/90 border border-slate-800 p-5 rounded-xl space-y-2 max-h-72 overflow-y-auto">
									{quizList.map((q) => (
										<div
											key={q.id}
											className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl gap-4"
										>
											<div>
												<p className="font-semibold text-white text-sm">{q.question}</p>
												<p className="text-xs text-emerald-400 font-mono mt-1">Ответ: {q.answer}</p>
											</div>
											<div className="flex gap-2 shrink-0">
												<button
													onClick={() => startEditQuiz(q)}
													className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg text-xs"
												>
													Изменить
												</button>
												<button
													onClick={() => handleDeleteQuiz(q.id)}
													className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-xs"
												>
													Удалить
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* 2. КАБИНЕТ ПОЛЬЗОВАТЕЛЯ */}
				{currentRole === 'user' && (
					<div className="space-y-8">
						<div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
							<div className="flex flex-wrap justify-between items-center gap-2">
								<div className="flex items-center gap-2">
									<Award className="w-5 h-5 text-cyan-400" />
									<h2 className="text-xl font-bold text-white">Прогресс исследователя — {rankTitle}</h2>
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
										<div
											key={c.id}
											className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex justify-between items-center gap-3"
										>
											<div>
												<p className="font-bold text-white text-sm">{c.name}</p>
												<p className="text-xs text-slate-400 font-mono">
													{c.latin} • {c.season}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={() => toggleStudied(c.id)}
													className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isDone
														? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
														: 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
														}`}
												>
													<CheckCircle2 className="w-3.5 h-3.5" />
													<span>{isDone ? 'Изучено' : 'Отметить'}</span>
												</button>
												<button
													onClick={() => toggleFavorite(c.id)}
													className={`p-2 rounded-lg border transition ${isFav
														? 'bg-rose-950/80 text-rose-400 border-rose-700'
														: 'bg-slate-900 text-slate-400 border-slate-700 hover:text-rose-400'
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

						<div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
							<div className="flex items-center gap-2">
								<NotebookPen className="w-5 h-5 text-purple-400" />
								<h2 className="text-xl font-bold text-white">Дневник наблюдений</h2>
							</div>

							{noteStatus && (
								<div className="text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200 p-3 rounded-xl">
									{noteStatus}
								</div>
							)}

							<form onSubmit={handleAddNote} className="space-y-3">
								<input
									type="text"
									placeholder="Заголовок наблюдения"
									value={noteTitle}
									onChange={(e) => setNoteTitle(e.target.value)}
									className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
								/>
								<textarea
									placeholder="Ваши заметки о звёздном небе..."
									rows={2}
									value={noteContent}
									onChange={(e) => setNoteContent(e.target.value)}
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
										<h3 className="font-bold text-white text-sm">{n.title}</h3>
										<p className="text-xs text-slate-300 mt-1">{n.content}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* 3. ГОСТЬ */}
				{currentRole === 'guest' && (
					<div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
						<h2 className="text-xl font-bold text-white">Гостевой режим</h2>
						<p className="text-slate-400 text-sm">
							Вы просматриваете сайт как гость. Чтобы сохранять изученные созвездия и заметки наблюдений, войдите в аккаунт или зарегистрируйтесь.
							Для доступа к панели администратора укажите секретный ключ при регистрации или войдите под учётной записью администратора.
						</p>
						<div className="flex flex-wrap gap-3 pt-2">
							<a
								href="/auth/login"
								className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
							>
								Войти в аккаунт
							</a>
							<a
								href="/auth/register"
								className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
							>
								Регистрация
							</a>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}