'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'

export default function MapPage() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const [constellations, setConstellations] = useState<any[]>([])
	const [selectedConstellation, setSelectedConstellation] = useState<any>(null)
	const [viewAll, setViewAll] = useState(false)

	// Выбранная звезда при клике и звезда под курсором
	const [selectedStar, setSelectedStar] = useState<any>(null)
	const [hoveredStar, setHoveredStar] = useState<any>(null)

	// Параметры для Zoom & Pan
	const [scale, setScale] = useState(1)
	const [offset, setOffset] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragMoved, setDragMoved] = useState(false)
	const [startPos, setStartPos] = useState({ x: 0, y: 0 })

	const bgStarsRef = useRef<any[]>([])

	useEffect(() => {
		// Генерация фоновых мерцающих звёзд космоса
		const colors = ['#ffffff', '#bae6fd', '#fde68a', '#ddd6fe', '#fbcfe8']
		bgStarsRef.current = Array.from({ length: 250 }, () => ({
			x: (Math.random() - 0.5) * 3000,
			y: (Math.random() - 0.5) * 3000,
			radius: Math.random() * 1.8 + 0.3,
			alpha: Math.random(),
			speed: (Math.random() - 0.5) * 0.03,
			color: colors[Math.floor(Math.random() * colors.length)],
		}))

		fetch('http://127.0.0.1:8000/api/constellations')
			.then(res => res.json())
			.then(data => {
				// Если у созвездия нет звёзд или линий, сгенерируем их автоматически, чтобы карта никогда не была пустой!
				const processed = data.map((c: any, idx: number) => {
					if (!c.stars || c.stars.length === 0) {
						const generatedStars = [
							{
								name: `Альфа ${c.name}`,
								x: 0,
								y: -60,
								size: 6,
								color: '#38bdf8',
								type: 'Голубой гигант',
								distance: '120 св. лет',
							},
							{
								name: `Бета ${c.name}`,
								x: -70,
								y: 40,
								size: 5,
								color: '#fde68a',
								type: 'Желтый карлик',
								distance: '85 св. лет',
							},
							{
								name: `Гамма ${c.name}`,
								x: 80,
								y: 50,
								size: 4.5,
								color: '#fbcfe8',
								type: 'Субгигант',
								distance: '210 св. лет',
							},
							{
								name: `Дельта ${c.name}`,
								x: 20,
								y: 90,
								size: 4,
								color: '#ffffff',
								type: 'Главная последовательность',
								distance: '140 св. лет',
							},
						]
						const generatedLines = [
							[0, 1],
							[0, 2],
							[1, 3],
							[2, 3],
						]
						return { ...c, stars: generatedStars, lines: generatedLines }
					}
					if (!c.lines || c.lines.length === 0) {
						// Авто-линии по порядку
						c.lines = c.stars.map((_: any, i: number) => [
							i,
							(i + 1) % c.stars.length,
						])
					}
					return c
				})

				setConstellations(processed)
				if (processed.length > 0) setSelectedConstellation(processed[0])
			})
			.catch(err => console.error('Ошибка загрузки:', err))
	}, [])

	const getWorldCoords = (clientX: number, clientY: number) => {
		const canvas = canvasRef.current
		if (!canvas) return { x: 0, y: 0 }
		const rect = canvas.getBoundingClientRect()
		const mouseX = clientX - rect.left
		const mouseY = clientY - rect.top

		return {
			x: (mouseX - canvas.width / 2 - offset.x) / scale,
			y: (mouseY - canvas.height / 2 - offset.y) / scale,
		}
	}

	const findStarAt = (worldX: number, worldY: number) => {
		const list = viewAll
			? constellations
			: selectedConstellation
				? [selectedConstellation]
				: []
		const hitRadius = 20 / scale

		for (let cIndex = 0; cIndex < list.length; cIndex++) {
			const c = list[cIndex]
			const shiftX = viewAll ? ((cIndex % 3) - 1) * 450 : 0
			const shiftY = viewAll ? (Math.floor(cIndex / 3) - 0.5) * 350 : 0

			for (const star of c.stars || []) {
				const sx = star.x + shiftX
				const sy = star.y + shiftY
				const dist = Math.hypot(worldX - sx, worldY - sy)
				if (dist <= hitRadius) {
					return {
						...star,
						constellationName: c.name,
						constellationLatin: c.latin,
					}
				}
			}
		}
		return null
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let animId: number

		const render = () => {
			canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
			canvas.height = 640

			// Глубокий космический фон + яркие туманности
			const bgGrad = ctx.createRadialGradient(
				canvas.width * 0.4,
				canvas.height * 0.4,
				50,
				canvas.width * 0.5,
				canvas.height * 0.5,
				canvas.width * 0.9,
			)
			bgGrad.addColorStop(0, '#0f172a')
			bgGrad.addColorStop(0.5, '#060b19')
			bgGrad.addColorStop(1, '#02040a')
			ctx.fillStyle = bgGrad
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			// Космическая туманность 1
			const nebula1 = ctx.createRadialGradient(
				canvas.width * 0.3 + offset.x * 0.2,
				canvas.height * 0.4 + offset.y * 0.2,
				20,
				canvas.width * 0.3 + offset.x * 0.2,
				canvas.height * 0.4 + offset.y * 0.2,
				400,
			)
			nebula1.addColorStop(0, 'rgba(56, 189, 248, 0.15)')
			nebula1.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)')
			nebula1.addColorStop(1, 'transparent')
			ctx.fillStyle = nebula1
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			// Космическая туманность 2
			const nebula2 = ctx.createRadialGradient(
				canvas.width * 0.75 + offset.x * 0.15,
				canvas.height * 0.65 + offset.y * 0.15,
				10,
				canvas.width * 0.75 + offset.x * 0.15,
				canvas.height * 0.65 + offset.y * 0.15,
				350,
			)
			nebula2.addColorStop(0, 'rgba(236, 72, 153, 0.1)')
			nebula2.addColorStop(1, 'transparent')
			ctx.fillStyle = nebula2
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			ctx.save()
			ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y)
			ctx.scale(scale, scale)

			// Координатная сетка
			ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
			ctx.lineWidth = 1 / scale
			for (let x = -1500; x <= 1500; x += 120) {
				ctx.beginPath()
				ctx.moveTo(x, -1500)
				ctx.lineTo(x, 1500)
				ctx.stroke()
			}
			for (let y = -1500; y <= 1500; y += 120) {
				ctx.beginPath()
				ctx.moveTo(-1500, y)
				ctx.lineTo(1500, y)
				ctx.stroke()
			}

			// Мерцающие звёзды фона
			bgStarsRef.current.forEach(s => {
				s.alpha += s.speed
				if (s.alpha <= 0.2 || s.alpha >= 1) s.speed *= -1

				ctx.beginPath()
				ctx.arc(s.x, s.y, s.radius / Math.sqrt(scale), 0, Math.PI * 2)
				ctx.fillStyle = s.color
				ctx.globalAlpha = s.alpha
				ctx.fill()
			})
			ctx.globalAlpha = 1

			// Отрисовка созвездий
			const listToDraw = viewAll
				? constellations
				: selectedConstellation
					? [selectedConstellation]
					: []

			listToDraw.forEach((c, cIndex) => {
				const stars = c.stars || []
				const lines = c.lines || []
				const shiftX = viewAll ? ((cIndex % 3) - 1) * 450 : 0
				const shiftY = viewAll ? (Math.floor(cIndex / 3) - 0.5) * 350 : 0

				// Неоновые линии созвездия
				ctx.save()
				ctx.shadowBlur = 14
				ctx.shadowColor = '#38bdf8'
				ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
				ctx.lineWidth = 2.5 / scale

				lines.forEach(([i, j]: [number, number]) => {
					if (stars[i] && stars[j]) {
						ctx.beginPath()
						ctx.moveTo(stars[i].x + shiftX, stars[i].y + shiftY)
						ctx.lineTo(stars[j].x + shiftX, stars[j].y + shiftY)
						ctx.stroke()
					}
				})
				ctx.restore()

				// Название созвездия
				if (stars.length > 0) {
					ctx.font = `bold ${15 / scale}px sans-serif`
					ctx.fillStyle = 'rgba(125, 211, 252, 0.6)'
					ctx.fillText(
						c.name.toUpperCase(),
						stars[0].x + shiftX - 25,
						stars[0].y + shiftY - 32 / scale,
					)
				}

				// Звёзды
				stars.forEach((star: any) => {
					const sx = star.x + shiftX
					const sy = star.y + shiftY
					const isHovered =
						hoveredStar?.name === star.name &&
						hoveredStar?.constellationName === c.name
					const isSelected =
						selectedStar?.name === star.name &&
						selectedStar?.constellationName === c.name

					const baseRadius = (star.size || 5) / scale
					const radius = isHovered || isSelected ? baseRadius * 1.5 : baseRadius
					const starColor = star.color || '#38bdf8'

					// Внешнее свечение звезды
					const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 5)
					glow.addColorStop(0, starColor)
					glow.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)')
					glow.addColorStop(1, 'transparent')

					ctx.beginPath()
					ctx.arc(sx, sy, radius * 5, 0, Math.PI * 2)
					ctx.fillStyle = glow
					ctx.fill()

					// Кольцо при выборе
					if (isHovered || isSelected) {
						ctx.beginPath()
						ctx.arc(sx, sy, radius * 2.5, 0, Math.PI * 2)
						ctx.strokeStyle = isSelected ? '#facc15' : '#38bdf8'
						ctx.lineWidth = 2 / scale
						ctx.stroke()
					}

					// Ядро звезды
					ctx.beginPath()
					ctx.arc(sx, sy, radius, 0, Math.PI * 2)
					ctx.fillStyle = '#ffffff'
					ctx.fill()

					// Лучи
					ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
					ctx.lineWidth = 1.2 / scale
					ctx.beginPath()
					ctx.moveTo(sx - radius * 2.5, sy)
					ctx.lineTo(sx + radius * 2.5, sy)
					ctx.moveTo(sx, sy - radius * 2.5)
					ctx.lineTo(sx, sy + radius * 2.5)
					ctx.stroke()

					// Имя звезды
					ctx.font = `${isHovered || isSelected ? 'bold ' : ''}${13 / scale}px sans-serif`
					ctx.fillStyle = isSelected ? '#fde047' : '#f1f5f9'
					ctx.fillText(
						star.name || 'Звезда',
						sx + radius + 8 / scale,
						sy + 4 / scale,
					)
				})
			})

			ctx.restore()
			animId = requestAnimationFrame(render)
		}

		render()
		return () => cancelAnimationFrame(animId)
	}, [
		constellations,
		selectedConstellation,
		viewAll,
		scale,
		offset,
		hoveredStar,
		selectedStar,
	])

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true)
		setDragMoved(false)
		setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		const coords = getWorldCoords(e.clientX, e.clientY)
		const found = findStarAt(coords.x, coords.y)
		setHoveredStar(found)

		if (!isDragging) return
		setDragMoved(true)
		setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y })
	}

	const handleMouseUp = (e: React.MouseEvent) => {
		setIsDragging(false)
		if (!dragMoved) {
			const coords = getWorldCoords(e.clientX, e.clientY)
			const clickedStar = findStarAt(coords.x, coords.y)
			if (clickedStar) {
				setSelectedStar(clickedStar)
			}
		}
	}

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault()
		const zoomFactor = 1.12
		if (e.deltaY < 0) {
			setScale(prev => Math.min(prev * zoomFactor, 4))
		} else {
			setScale(prev => Math.max(prev / zoomFactor, 0.45))
		}
	}

	return (
		<main className='min-h-screen bg-[#030712] text-slate-100 flex flex-col'>
			<Navbar />

			<div className='flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-5'>
				{/* Панель управления */}
				<div className='flex flex-wrap justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl gap-4 backdrop-blur-md shadow-xl'>
					<div className='flex flex-wrap items-center gap-3'>
						<span className='text-sm font-semibold text-slate-400'>
							Созвездие:
						</span>
						<select
							disabled={viewAll}
							value={selectedConstellation?.id || ''}
							onChange={e => {
								const found = constellations.find(
									c => c.id === Number(e.target.value),
								)
								setSelectedConstellation(found)
								setSelectedStar(null)
								setOffset({ x: 0, y: 0 })
								setScale(1)
							}}
							className='bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-500 disabled:opacity-40'
						>
							{constellations.map(c => (
								<option key={c.id} value={c.id}>
									{c.name} ({c.latin})
								</option>
							))}
						</select>

						<button
							onClick={() => {
								setViewAll(!viewAll)
								setScale(viewAll ? 1 : 0.65)
								setOffset({ x: 0, y: 0 })
							}}
							className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
								viewAll
									? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25'
									: 'bg-slate-950 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950/50'
							}`}
						>
							{viewAll ? '✨ Показано всё небо' : '🌌 Показать все созвездия'}
						</button>
					</div>

					<div className='flex items-center gap-3'>
						<button
							onClick={() => {
								setScale(1)
								setOffset({ x: 0, y: 0 })
							}}
							className='bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-700'
						>
							🎯 Центр карты
						</button>
					</div>
				</div>

				{/* Холст и информационное окно */}
				<div className='relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl'>
					<canvas
						ref={canvasRef}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={() => setIsDragging(false)}
						onWheel={handleWheel}
						style={{
							cursor: hoveredStar
								? 'pointer'
								: isDragging
									? 'grabbing'
									: 'grab',
						}}
						className='w-full h-[640px] block'
					/>

					{/* Карточка звезды при клике */}
					{selectedStar && (
						<div className='absolute top-5 right-5 w-80 bg-slate-900/90 border border-cyan-500/50 p-5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in'>
							<div className='flex justify-between items-start mb-3'>
								<div>
									<span className='text-[11px] uppercase tracking-wider font-mono text-cyan-400 block mb-0.5'>
										Созвездие: {selectedStar.constellationName}
									</span>
									<h3 className='text-xl font-extrabold text-white flex items-center gap-2'>
										⭐ {selectedStar.name}
									</h3>
								</div>
								<button
									onClick={() => setSelectedStar(null)}
									className='text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition'
								>
									✕
								</button>
							</div>

							<div className='space-y-2.5 text-xs border-t border-slate-800 pt-3'>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Тип звезды:</span>
									<span className='text-amber-300 font-semibold'>
										{selectedStar.type || 'Главная последовательность'}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Расстояние:</span>
									<span className='text-cyan-300 font-mono'>
										{selectedStar.distance || '~150 св. лет'}
									</span>
								</div>
							</div>

							<p className='text-slate-300 text-xs leading-relaxed mt-3 pt-3 border-t border-slate-800/80'>
								{selectedStar.info ||
									`Звезда ${selectedStar.name} является частью уникального космического узора созвездия ${selectedStar.constellationName} (${selectedStar.constellationLatin}).`}
							</p>
						</div>
					)}

					<div className='absolute bottom-4 left-4 bg-slate-900/85 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 pointer-events-none backdrop-blur-md'>
						✨ Кликайте по звёздам для просмотра информации • Колёсико мыши —
						зум • Перетаскивание — панорама
					</div>
				</div>
			</div>
		</main>
	)
}
