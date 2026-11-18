'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function DateFinderPage() {
	const [month, setMonth] = useState(1)
	const [day, setDay] = useState(1)
	const [result, setResult] = useState<any>(null)
	const [loading, setLoading] = useState(false)

	const findConstellation = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			const res = await fetch(
				`http://127.0.0.1:8000/api/constellations/by-date?month=${month}&day=${day}`,
			)
			const data = await res.json()
			setResult(data)
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='min-h-screen bg-[#030712] text-slate-100 flex flex-col'>
			<Navbar />
			<div className='flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full'>
				<h1 className='text-3xl font-bold text-cyan-400 mb-6 text-center'>
					📅 Поиск созвездия по дате рождения
				</h1>

				<form
					onSubmit={findConstellation}
					className='bg-slate-900/80 border border-slate-800 p-6 rounded-2xl w-full space-y-4 shadow-xl'
				>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm text-slate-400 mb-1'>Месяц</label>
							<select
								value={month}
								onChange={e => setMonth(Number(e.target.value))}
								className='w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white'
							>
								{[
									'Январь',
									'Февраль',
									'Март',
									'Апрель',
									'Май',
									'Июнь',
									'Июль',
									'Август',
									'Сентябрь',
									'Октябрь',
									'Ноябрь',
									'Декабрь',
								].map((m, idx) => (
									<option key={idx} value={idx + 1}>
										{m}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-sm text-slate-400 mb-1'>День</label>
							<input
								type='number'
								min='1'
								max='31'
								value={day}
								onChange={e => setDay(Number(e.target.value))}
								className='w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white'
							/>
						</div>
					</div>
					<button
						type='submit'
						className='w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/25'
					>
						{loading ? 'Ищем на звездной карте...' : 'Узнать свое созвездие'}
					</button>
				</form>

				{result && (
					<div className='mt-8 bg-slate-900/90 border border-cyan-500/40 p-6 rounded-2xl w-full shadow-2xl animate-fade-in'>
						<div className='flex justify-between items-start mb-3'>
							<h2 className='text-2xl font-bold text-white'>{result.name}</h2>
							<span className='text-xs bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full font-mono border border-cyan-800'>
								{result.latin}
							</span>
						</div>
						<p className='text-slate-300 text-sm mb-4 leading-relaxed'>
							{result.description}
						</p>
						<div className='flex justify-between items-center pt-3 border-t border-slate-800'>
							<span className='text-xs text-slate-500 font-mono'>
								Сезон видимости: {result.season}
							</span>
							<a
								href={`/map?highlight=${result.id}`}
								className='bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition'
							>
								Посмотреть на карте ✨
							</a>
						</div>
					</div>
				)}
			</div>
		</main>
	)
}
