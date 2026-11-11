'use client'
import { useEffect, useRef, useState } from 'react'

export default function StarMapPage() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const [constellations, setConstellations] = useState<any[]>([])
	const [selectedStar, setSelectedStar] = useState<any | null>(null)
	const [scale, setScale] = useState(1)
	const [offset, setOffset] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [startPos, setStartPos] = useState({ x: 0, y: 0 })

	// Загружаем созвездия со всеми звездами с бэкенда
	useEffect(() => {
		fetch('http://127.0.0.1:8000/api/constellations')
			.then(res => res.json())
			.then(data => setConstellations(data))
			.catch(err => console.error('Ошибка загрузки карты:', err))
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = window.innerWidth
		canvas.height = window.innerHeight

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			ctx.save()
			ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y)
			ctx.scale(scale, scale)

			// Сетка карты
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
			ctx.lineWidth = 1
			for (let x = -1500; x < 1500; x += 150) {
				ctx.beginPath()
				ctx.moveTo(x, -1500)
				ctx.lineTo(x, 1500)
				ctx.stroke()
			}
			for (let y = -1500; y < 1500; y += 150) {
				ctx.beginPath()
				ctx.moveTo(-1500, y)
				ctx.lineTo(1500, y)
				ctx.stroke()
			}

			// Отрисовка созвездий и их звезд
			constellations.forEach((constellation, cIdx) => {
				// Разносим созвездия по разным частям карты
				const offsetX = (cIdx % 2 === 0 ? 1 : -1) * (350 * (cIdx + 1))
				const offsetY = (cIdx > 1 ? 1 : -1) * 250

				const stars = constellation.stars || []

				// Соединительные линии
				if (stars.length > 1) {
					ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
					ctx.lineWidth = 1.5
					ctx.beginPath()
					stars.forEach((s: any, idx: number) => {
						const px = s.x + offsetX
						const py = s.y + offsetY
						if (idx === 0) ctx.moveTo(px, py)
						else ctx.lineTo(px, py)
					})
					ctx.stroke()
				}

				// Звезды
				stars.forEach((star: any) => {
					const drawX = star.x + offsetX
					const drawY = star.y + offsetY

					// Свечение
					const gradient = ctx.createRadialGradient(
						drawX,
						drawY,
						0,
						drawX,
						drawY,
						14,
					)
					gradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)')
					gradient.addColorStop(1, 'rgba(56, 189, 248, 0)')
					ctx.fillStyle = gradient
					ctx.beginPath()
					ctx.arc(drawX, drawY, 14, 0, Math.PI * 2)
					ctx.fill()

					// Точка звезды
					ctx.fillStyle = '#ffffff'
					ctx.beginPath()
					ctx.arc(drawX, drawY, 4, 0, Math.PI * 2)
					ctx.fill()

					// Текст
					ctx.fillStyle = '#94a3b8'
					ctx.font = '11px sans-serif'
					ctx.fillText(
						`${star.name} (${constellation.name})`,
						drawX + 10,
						drawY + 4,
					)

					// Сохраняем абсолютные координаты для клика
					star._renderX = drawX
					star._renderY = drawY
					star._constellationName = constellation.name
				})
			})

			ctx.restore()
		}

		render()
	}, [constellations, scale, offset])

	// Клик по звездам на холсте
	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current
		if (!canvas) return
		const rect = canvas.getBoundingClientRect()
		const clickX = e.clientX - rect.left - canvas.width / 2 - offset.x
		const clickY = e.clientY - rect.top - canvas.height / 2 - offset.y

		let found = null
		constellations.forEach(c => {
			c.stars?.forEach((star: any) => {
				const starX = star._renderX * scale
				const starY = star._renderY * scale
				// Проверяем радиус клика с учетом масштаба
				const dx = clickX - star._renderX
				const dy = clickY - star._renderY
				if (Math.sqrt(dx * dx + dy * dy) < 25 / scale) {
					found = { ...star, constellation: c.name }
				}
			})
		})

		if (found) setSelectedStar(found)
	}

	return (
		<main className='relative w-screen h-screen bg-[#030712] overflow-hidden select-none'>
			<div className='absolute top-6 left-6 z-10 flex items-center gap-4'>
				<a
					href='/'
					className='bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:border-cyan-500 transition'
				>
					← На главную
				</a>
				<h1 className='text-xl font-bold text-cyan-400 hidden sm:block'>
					🗺️ Интерактивная карта звездного неба
				</h1>
			</div>

			<div className='absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl text-xs text-slate-400 max-w-xs'>
				<p className='font-semibold text-slate-200 mb-1'>Управление:</p>
				<p>• Перетаскивайте карту мышкой.</p>
				<p>• Масштабируйте колесиком.</p>
				<p>• Кликайте по звёздам для информации.</p>
			</div>

			<canvas
				ref={canvasRef}
				onClick={handleCanvasClick}
				onWheel={e => {
					e.preventDefault()
					setScale(prev => Math.min(Math.max(0.4, prev - e.deltaY * 0.001), 3))
				}}
				onMouseDown={e => {
					setIsDragging(true)
					setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
				}}
				onMouseMove={e => {
					if (!isDragging) return
					setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y })
				}}
				onMouseUp={() => setIsDragging(false)}
				className='cursor-grab active:cursor-grabbing w-full h-full'
			/>

			{selectedStar && (
				<div className='absolute right-6 top-6 z-20 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200'>
					<div className='flex justify-between items-start mb-3'>
						<h2 className='text-lg font-bold text-white'>
							{selectedStar.name}
						</h2>
						<button
							onClick={() => setSelectedStar(null)}
							className='text-slate-400 hover:text-white text-sm font-mono'
						>
							✕
						</button>
					</div>
					<p className='text-xs text-cyan-400 font-mono mb-2'>
						Созвездие: {selectedStar.constellation}
					</p>
					<p className='text-sm text-slate-300 leading-relaxed mb-4'>
						{selectedStar.info}
					</p>
					<button
						onClick={() =>
							alert(`Объект "${selectedStar.name}" сохранен в избранное!`)
						}
						className='w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20'
					>
						★ В избранное
					</button>
				</div>
			)}
		</main>
	)
}
