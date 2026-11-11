'use client'
import { useState, useEffect } from 'react'

export default function EncyclopediaPage() {
	const [constellations, setConstellations] = useState<any[]>([])
	const [search, setSearch] = useState('')

	useEffect(() => {
		fetch('http://127.0.0.1:8000/api/constellations')
			.then(res => res.json())
			.then(data => setConstellations(data))
			.catch(err => console.error('Ошибка загрузки:', err))
	}, [])

	const filtered = constellations.filter(
		item =>
			item.name.toLowerCase().includes(search.toLowerCase()) ||
			item.latin.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<main className='min-h-screen bg-[#030712] text-slate-100 p-8'>
			<div className='max-w-5xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<a
						href='/'
						className='text-slate-400 hover:text-cyan-400 transition text-sm font-semibold'
					>
						← На главную
					</a>
					<h1 className='text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>
						📖 Энциклопедия созвездий
					</h1>
				</div>

				{/* Поиск */}
				<div className='mb-8'>
					<input
						type='text'
						placeholder='Поиск по названию созвездия...'
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='w-full bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-cyan-500 transition shadow-lg'
					/>
				</div>

				{/* Список объектов */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{filtered.map(item => (
						<div
							key={item.id}
							className='bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl hover:border-cyan-500/50 transition'
						>
							<div className='flex justify-between items-start mb-3'>
								<h2 className='text-xl font-bold text-white'>{item.name}</h2>
								<span className='text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono'>
									{item.latin}
								</span>
							</div>
							<p className='text-sm text-slate-300 mb-4 leading-relaxed'>
								{item.description}
							</p>
							<div className='text-xs text-slate-400 space-y-1 border-t border-slate-800/80 pt-3'>
								<p>
									📍 Расположение:{' '}
									<span className='text-slate-200'>{item.location}</span>
								</p>
								<p>
									✨ Мифология:{' '}
									<span className='text-slate-200'>{item.history}</span>
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	)
}
