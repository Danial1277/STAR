'use client';
import { useState, useEffect, useRef } from 'react';

export default function MapPage() {
	const [constellations, setConstellations] = useState<any[]>([]);
	const [selectedConstellation, setSelectedConstellation] = useState<any>(null);
	const [selectedStar, setSelectedStar] = useState<any>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		fetch('http://127.0.0.1:8000/api/constellations')
			.then((res) => res.json())
			.then((data) => {
				setConstellations(data);
				if (data.length > 0) setSelectedConstellation(data[0]);
			})
			.catch((err) => console.error('Ошибка загрузки:', err));
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrameId: number;
		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		const render = () => {
			ctx.clearRect(0, 0, width, height);

			if (selectedConstellation && selectedConstellation.stars) {
				const centerX = width / 2;
				const centerY = height / 2;

				// 1. Рисуем линии созвездия
				ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
				ctx.lineWidth = 2;
				ctx.beginPath();
				selectedConstellation.stars.forEach((star: any, index: number) => {
					const x = centerX + star.x;
					const y = centerY + star.y;
					if (index === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				});
				ctx.stroke();

				// 2. Рисуем звезды со свечением
				selectedConstellation.stars.forEach((star: any) => {
					const x = centerX + star.x;
					const y = centerY + star.y;

					// Неоновое свечение
					ctx.shadowBlur = 15;
					ctx.shadowColor = '#38bdf8';

					ctx.fillStyle = '#ffffff';
					ctx.beginPath();
					ctx.arc(x, y, 7, 0, Math.PI * 2);
					ctx.fill();

					// Сбрасываем тень для текста
					ctx.shadowBlur = 0;

					// Подпись звезды
					ctx.font = 'bold 13px sans-serif';
					ctx.fillStyle = '#e2e8f0';
					ctx.fillText(star.name, x + 12, y + 4);
				});
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		const handleCanvasClick = (event: MouseEvent) => {
			if (!selectedConstellation || !selectedConstellation.stars) return;
			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			const centerX = width / 2;
			const centerY = height / 2;

			selectedConstellation.stars.forEach((star: any) => {
				const x = centerX + star.x;
				const y = centerY + star.y;
				const distance = Math.hypot(mouseX - x, mouseY - y);

				if (distance < 20) {
					setSelectedStar(star);
				}
			});
		};

		canvas.addEventListener('click', handleCanvasClick);

		return () => {
			cancelAnimationFrame(animationFrameId);
			canvas.removeEventListener('click', handleCanvasClick);
		};
	}, [selectedConstellation]);

	return (
		<main className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
			<canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-pointer" />

			{/* Панель выбора созвездий сверху */}
			<div className="absolute top-6 z-10 flex gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
				{constellations.map((c) => (
					<button
						key={c.id}
						onClick={() => {
							setSelectedConstellation(c);
							setSelectedStar(null);
						}}
						className={`px-4 py-2 rounded-xl font-medium transition ${selectedConstellation?.id === c.id
							? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
							: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
							}`}
					>
						{c.name}
					</button>
				))}
			</div>

			{/* Карточка информации о выбранной звезде */}
			{selectedStar && (
				<div className="absolute bottom-10 z-10 bg-slate-900/90 border border-cyan-500/50 p-6 rounded-2xl max-w-md backdrop-blur-xl shadow-2xl animate-fade-in">
					<div className="flex justify-between items-start mb-2">
						<h3 className="text-xl font-bold text-cyan-400">✨ {selectedStar.name}</h3>
						<button
							onClick={() => setSelectedStar(null)}
							className="text-slate-400 hover:text-white text-sm font-mono"
						>
							✕ Закрыть
						</button>
					</div>
					<p className="text-slate-300 text-sm leading-relaxed">{selectedStar.info}</p>
				</div>
			)}
		</main>
	);
}