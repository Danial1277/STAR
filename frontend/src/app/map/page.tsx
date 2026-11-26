'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import {
	Plus,
	Minus,
	LocateFixed,
	ChevronUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Globe,
	Sparkles,
	Star,
	X,
} from 'lucide-react';

export default function MapPage() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [constellations, setConstellations] = useState<any[]>([]);
	const [selectedConstellation, setSelectedConstellation] = useState<any>(null);
	const [viewAll, setViewAll] = useState(false);

	const [selectedStar, setSelectedStar] = useState<any>(null);
	const [hoveredStar, setHoveredStar] = useState<any>(null);

	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragMoved, setDragMoved] = useState(false);
	const [startPos, setStartPos] = useState({ x: 0, y: 0 });

	const bgStarsRef = useRef<any[]>([]);

	useEffect(() => {
		const colors = ['#ffffff', '#bae6fd', '#fde68a', '#ddd6fe', '#fbcfe8'];
		bgStarsRef.current = Array.from({ length: 240 }, () => ({
			x: (Math.random() - 0.5) * 3000,
			y: (Math.random() - 0.5) * 3000,
			radius: Math.random() * 1.8 + 0.4,
			alpha: Math.random(),
			speed: (Math.random() - 0.5) * 0.03,
			color: colors[Math.floor(Math.random() * colors.length)],
		}));

		fetch('http://127.0.0.1:8000/api/constellations')
			.then((res) => res.json())
			.then((data) => {
				const processed = data.map((c: any) => {
					if (!c.stars || c.stars.length === 0) {
						return {
							...c,
							stars: [
								{ name: `Альфа ${c.name}`, x: 0, y: -65, size: 6.5, color: '#38bdf8', type: 'Голубой гигант', distance: '120 св. лет' },
								{ name: `Бета ${c.name}`, x: -75, y: 35, size: 5.5, color: '#fde68a', type: 'Жёлтый карлик', distance: '85 св. лет' },
								{ name: `Гамма ${c.name}`, x: 80, y: 45, size: 5, color: '#fbcfe8', type: 'Субгигант', distance: '210 св. лет' },
								{ name: `Дельта ${c.name}`, x: 15, y: 95, size: 4.5, color: '#ffffff', type: 'Главная последовательность', distance: '140 св. лет' },
							],
							lines: [[0, 1], [0, 2], [1, 3], [2, 3]],
						};
					}
					if (!c.lines || c.lines.length === 0) {
						c.lines = c.stars.map((_: any, i: number) => [i, (i + 1) % c.stars.length]);
					}
					return c;
				});

				setConstellations(processed);
				if (processed.length > 0) setSelectedConstellation(processed[0]);
			})
			.catch((err) => console.error('Ошибка загрузки:', err));
	}, []);

	const zoomIn = () => setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
	const zoomOut = () => setScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
	const resetView = () => {
		setScale(1);
		setOffset({ x: 0, y: 0 });
	};
	const panBy = (dx: number, dy: number) => {
		setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
	};

	const stepConstellation = (dir: number) => {
		if (!constellations.length || !selectedConstellation) return;
		const idx = constellations.findIndex((c) => c.id === selectedConstellation.id);
		const nextIdx = (idx + dir + constellations.length) % constellations.length;
		setSelectedConstellation(constellations[nextIdx]);
		setSelectedStar(null);
		resetView();
	};

	const getWorldCoords = (clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: (clientX - rect.left - canvas.width / 2 - offset.x) / scale,
			y: (clientY - rect.top - canvas.height / 2 - offset.y) / scale,
		};
	};

	const findStarAt = (worldX: number, worldY: number) => {
		const list = viewAll ? constellations : selectedConstellation ? [selectedConstellation] : [];
		const hitRadius = 22 / scale;

		for (let cIndex = 0; cIndex < list.length; cIndex++) {
			const c = list[cIndex];
			const shiftX = viewAll ? ((cIndex % 3) - 1) * 450 : 0;
			const shiftY = viewAll ? (Math.floor(cIndex / 3) - 0.5) * 350 : 0;

			for (const star of c.stars || []) {
				const dist = Math.hypot(worldX - (star.x + shiftX), worldY - (star.y + shiftY));
				if (dist <= hitRadius) {
					return { ...star, constellationName: c.name, constellationLatin: c.latin };
				}
			}
		}
		return null;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animId: number;

		const render = () => {
			canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
			canvas.height = 640;

			const bgGrad = ctx.createRadialGradient(
				canvas.width * 0.4,
				canvas.height * 0.4,
				50,
				canvas.width * 0.5,
				canvas.height * 0.5,
				canvas.width * 0.9
			);
			bgGrad.addColorStop(0, '#0f172a');
			bgGrad.addColorStop(0.5, '#060b19');
			bgGrad.addColorStop(1, '#02040a');
			ctx.fillStyle = bgGrad;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const nebula = ctx.createRadialGradient(
				canvas.width * 0.35 + offset.x * 0.2,
				canvas.height * 0.45 + offset.y * 0.2,
				20,
				canvas.width * 0.35 + offset.x * 0.2,
				canvas.height * 0.45 + offset.y * 0.2,
				420
			);
			nebula.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
			nebula.addColorStop(0.5, 'rgba(139, 92, 246, 0.09)');
			nebula.addColorStop(1, 'transparent');
			ctx.fillStyle = nebula;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.save();
			ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
			ctx.scale(scale, scale);

			ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
			ctx.lineWidth = 1 / scale;
			for (let x = -1500; x <= 1500; x += 120) {
				ctx.beginPath();
				ctx.moveTo(x, -1500);
				ctx.lineTo(x, 1500);
				ctx.stroke();
			}
			for (let y = -1500; y <= 1500; y += 120) {
				ctx.beginPath();
				ctx.moveTo(-1500, y);
				ctx.lineTo(1500, y);
				ctx.stroke();
			}

			bgStarsRef.current.forEach((s) => {
				s.alpha += s.speed;
				if (s.alpha <= 0.2 || s.alpha >= 1) s.speed *= -1;
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.radius / Math.sqrt(scale), 0, Math.PI * 2);
				ctx.fillStyle = s.color;
				ctx.globalAlpha = s.alpha;
				ctx.fill();
			});
			ctx.globalAlpha = 1;

			const listToDraw = viewAll ? constellations : selectedConstellation ? [selectedConstellation] : [];

			listToDraw.forEach((c, cIndex) => {
				const stars = c.stars || [];
				const lines = c.lines || [];
				const shiftX = viewAll ? ((cIndex % 3) - 1) * 450 : 0;
				const shiftY = viewAll ? (Math.floor(cIndex / 3) - 0.5) * 350 : 0;

				ctx.save();
				ctx.shadowBlur = 14;
				ctx.shadowColor = '#38bdf8';
				ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
				ctx.lineWidth = 2.6 / scale;
				lines.forEach(([i, j]: [number, number]) => {
					if (stars[i] && stars[j]) {
						ctx.beginPath();
						ctx.moveTo(stars[i].x + shiftX, stars[i].y + shiftY);
						ctx.lineTo(stars[j].x + shiftX, stars[j].y + shiftY);
						ctx.stroke();
					}
				});
				ctx.restore();

				if (stars.length > 0) {
					ctx.font = `bold ${15 / scale}px sans-serif`;
					ctx.fillStyle = 'rgba(125, 211, 252, 0.7)';
					ctx.fillText(c.name.toUpperCase(), stars[0].x + shiftX - 25, stars[0].y + shiftY - 32 / scale);
				}

				stars.forEach((star: any) => {
					const sx = star.x + shiftX;
					const sy = star.y + shiftY;
					const isHovered = hoveredStar?.name === star.name && hoveredStar?.constellationName === c.name;
					const isSelected = selectedStar?.name === star.name && selectedStar?.constellationName === c.name;

					const baseRadius = (star.size || 5.5) / scale;
					const radius = isHovered || isSelected ? baseRadius * 1.5 : baseRadius;
					const starColor = star.color || '#38bdf8';

					const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 5);
					glow.addColorStop(0, starColor);
					glow.addColorStop(0.4, 'rgba(56, 189, 248, 0.45)');
					glow.addColorStop(1, 'transparent');
					ctx.beginPath();
					ctx.arc(sx, sy, radius * 5, 0, Math.PI * 2);
					ctx.fillStyle = glow;
					ctx.fill();

					if (isHovered || isSelected) {
						ctx.beginPath();
						ctx.arc(sx, sy, radius * 2.5, 0, Math.PI * 2);
						ctx.strokeStyle = isSelected ? '#facc15' : '#38bdf8';
						ctx.lineWidth = 2 / scale;
						ctx.stroke();
					}

					ctx.beginPath();
					ctx.arc(sx, sy, radius, 0, Math.PI * 2);
					ctx.fillStyle = '#ffffff';
					ctx.fill();

					ctx.font = `${isHovered || isSelected ? 'bold ' : ''}${14 / scale}px sans-serif`;
					ctx.fillStyle = isSelected ? '#fde047' : '#f8fafc';
					ctx.fillText(star.name || 'Звезда', sx + radius + 8 / scale, sy + 4 / scale);
				});
			});

			ctx.restore();
			animId = requestAnimationFrame(render);
		};

		render();
		return () => cancelAnimationFrame(animId);
	}, [constellations, selectedConstellation, viewAll, scale, offset, hoveredStar, selectedStar]);

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setDragMoved(false);
		setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		const coords = getWorldCoords(e.clientX, e.clientY);
		setHoveredStar(findStarAt(coords.x, coords.y));
		if (!isDragging) return;
		setDragMoved(true);
		setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		setIsDragging(false);
		if (!dragMoved) {
			const coords = getWorldCoords(e.clientX, e.clientY);
			const clicked = findStarAt(coords.x, coords.y);
			if (clicked) setSelectedStar(clicked);
		}
	};

	return (
		<main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
			<Navbar />

			<div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-4">
				{/* Верхняя панель выбора созвездия */}
				<div className="flex flex-wrap justify-between items-center bg-slate-900/90 border border-slate-800 p-4 rounded-2xl gap-3 backdrop-blur-xl shadow-xl">
					<div className="flex flex-wrap items-center gap-2.5">
						<button
							onClick={() => stepConstellation(-1)}
							disabled={viewAll}
							title="Предыдущее созвездие"
							className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 transition"
						>
							<ChevronLeft className="w-5 h-5" />
						</button>

						<select
							disabled={viewAll}
							value={selectedConstellation?.id || ''}
							onChange={(e) => {
								const found = constellations.find((c) => c.id === Number(e.target.value));
								setSelectedConstellation(found);
								setSelectedStar(null);
								resetView();
							}}
							className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-base font-semibold outline-none focus:border-cyan-500 disabled:opacity-40"
						>
							{constellations.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name} ({c.latin})
								</option>
							))}
						</select>

						<button
							onClick={() => stepConstellation(1)}
							disabled={viewAll}
							title="Следующее созвездие"
							className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 transition"
						>
							<ChevronRight className="w-5 h-5" />
						</button>

						<button
							onClick={() => {
								const nextAll = !viewAll;
								setViewAll(nextAll);
								setScale(nextAll ? 0.65 : 1);
								setOffset({ x: 0, y: 0 });
							}}
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition border ${viewAll
								? 'bg-cyan-500 text-slate-950 border-cyan-400'
								: 'bg-slate-950 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950/60'
								}`}
						>
							{viewAll ? <Sparkles className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
							<span>{viewAll ? 'Показано всё небо' : 'Все созвездия'}</span>
						</button>
					</div>

					<div className="text-xs font-mono text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
						Масштаб: <span className="text-cyan-400 font-bold">{Math.round(scale * 100)}%</span>
					</div>
				</div>

				{/* Холст + Крупные кнопки навигации в стиле 2ГИС */}
				<div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
					<canvas
						ref={canvasRef}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={() => setIsDragging(false)}
						onWheel={(e) => {
							e.preventDefault();
							e.deltaY < 0 ? zoomIn() : zoomOut();
						}}
						style={{ cursor: hoveredStar ? 'pointer' : isDragging ? 'grabbing' : 'grab' }}
						className="w-full h-[640px] block"
					/>

					{/* Пульт зума и сдвига (в стиле 2ГИС — крупные удобные кнопки) */}
					<div className="absolute bottom-5 right-5 flex flex-col gap-2.5 z-20">
						{/* Кнопки приближения / отдаления / центр */}
						<div className="flex flex-col bg-slate-900/95 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
							<button
								onClick={zoomIn}
								title="Приблизить"
								className="p-3.5 hover:bg-cyan-500/20 text-white hover:text-cyan-300 border-b border-slate-800 transition flex items-center justify-center"
							>
								<Plus className="w-6 h-6" />
							</button>
							<button
								onClick={resetView}
								title="Вернуть в центр"
								className="p-3.5 hover:bg-cyan-500/20 text-cyan-400 border-b border-slate-800 transition flex items-center justify-center"
							>
								<LocateFixed className="w-6 h-6" />
							</button>
							<button
								onClick={zoomOut}
								title="Отдалить"
								className="p-3.5 hover:bg-cyan-500/20 text-white hover:text-cyan-300 transition flex items-center justify-center"
							>
								<Minus className="w-6 h-6" />
							</button>
						</div>

						{/* Крестовина сдвига карты */}
						<div className="grid grid-cols-3 gap-1 bg-slate-900/95 border border-slate-700 p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
							<div />
							<button
								onClick={() => panBy(0, 90)}
								title="Сдвинуть вверх"
								className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/25 text-white flex items-center justify-center"
							>
								<ChevronUp className="w-5 h-5" />
							</button>
							<div />
							<button
								onClick={() => panBy(90, 0)}
								title="Сдвинуть влево"
								className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/25 text-white flex items-center justify-center"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								onClick={resetView}
								title="Центр"
								className="p-2.5 rounded-xl bg-slate-950 text-[11px] font-mono text-cyan-400 flex items-center justify-center"
							>
								0,0
							</button>
							<button
								onClick={() => panBy(-90, 0)}
								title="Сдвинуть вправо"
								className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/25 text-white flex items-center justify-center"
							>
								<ChevronRight className="w-5 h-5" />
							</button>
							<div />
							<button
								onClick={() => panBy(0, -90)}
								title="Сдвинуть вниз"
								className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/25 text-white flex items-center justify-center"
							>
								<ChevronDown className="w-5 h-5" />
							</button>
							<div />
						</div>
					</div>

					{/* Карточка выбранной звезды */}
					{selectedStar && (
						<div className="absolute top-5 right-5 w-80 bg-slate-900/95 border border-cyan-500/50 p-5 rounded-2xl shadow-2xl backdrop-blur-xl z-20">
							<div className="flex justify-between items-start mb-3">
								<div>
									<span className="text-[11px] uppercase tracking-wider font-mono text-cyan-400 block mb-0.5">
										{selectedStar.constellationName}
									</span>
									<h3 className="text-xl font-extrabold text-white flex items-center gap-2">
										<Star className="w-5 h-5 text-amber-400 fill-amber-400" />
										<span>{selectedStar.name}</span>
									</h3>
								</div>
								<button
									onClick={() => setSelectedStar(null)}
									className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							<div className="space-y-2 text-xs border-t border-slate-800 pt-3">
								<div className="flex justify-between">
									<span className="text-slate-400">Тип звезды:</span>
									<span className="text-amber-300 font-semibold">{selectedStar.type || 'Главная последовательность'}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Расстояние:</span>
									<span className="text-cyan-300 font-mono">{selectedStar.distance || '~150 св. лет'}</span>
								</div>
							</div>

							<p className="text-slate-300 text-xs leading-relaxed mt-3 pt-3 border-t border-slate-800/80">
								{selectedStar.info ||
									`${selectedStar.name} — яркая звезда созвездия ${selectedStar.constellationName} (${selectedStar.constellationLatin}). Нажмите на другую звезду, чтобы сравнить.`}
							</p>
						</div>
					)}

					<div className="hidden sm:block absolute bottom-5 left-5 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-300 pointer-events-none backdrop-blur-md">
						Нажмите на звезду для справки • Используйте кнопки «+ / -» и стрелки для удобной навигации
					</div>
				</div>
			</div>
		</main>
	);
}