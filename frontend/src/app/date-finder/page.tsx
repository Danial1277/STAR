'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Calendar, Sparkles, Compass } from 'lucide-react'

const MONTHS = [
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
]

export default function DateFinderPage() {
	const [month, setMonth] = useState(11)
	const [day, setDay] = useState(25)
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
				<div className='flex items-center gap-2.5 text-cyan-400 mb-6'>
					<Calendar className='w-7 h-7' />
					<h1 className='text-3xl font-bold text-white'>
						Созвездие по дате в любое время года
					</h1>
				</div>

				<form
					onSubmit={findConstellation}
					className='bg-slate-900/85 border border-slate-800 p-6 rounded-2xl w-full space-y-5 shadow-2xl backdrop-blur-xl'
				>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm text-slate-400 mb-1.5'>
								Месяц
							</label>
							<select
								value={month}
								onChange={e => setMonth(Number(e.target.value))}
								className='w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-cyan-500'
							>
								{MONTHS.map((m, idx) => (
									<option key={m} value={idx + 1}>
										{m}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-sm text-slate-400 mb-1.5'>
								День месяца
							</label>
							<input
								type='number'
								min='1'
								max='31'
								value={day}
								onChange={e => setDay(Number(e.target.value))}
								className='w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-cyan-500'
							/>
						</div>
					</div>

					<button
						type='submit'
						className='w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-base'
					>
						<Sparkles className='w-5 h-5' />
						<span>
							{loading
								? 'Подбираем созвездие...'
								: 'Найти созвездие для этой даты'}
						</span>
					</button>
				</form>

				{result && (
					<div className='mt-8 bg-slate-900/90 border border-cyan-500/40 p-6 rounded-2xl w-full shadow-2xl space-y-4'>
						<div className='flex flex-wrap justify-between items-start gap-2'>
							<div>
								<span className='text-xs font-mono uppercase text-purple-400 bg-purple-950/60 border border-purple-800/50 px-3 py-1 rounded-full'>
									Время года: {result.matchedSeason || result.season}
								</span>
								<h2 className='text-2xl font-bold text-white mt-2'>
									{result.dateConstellationName || result.name}
								</h2>
							</div>
							<span className='text-xs bg-cyan-950 text-cyan-400 px-3 py-1.5 rounded-full font-mono border border-cyan-800'>
								{result.dateConstellationLatin || result.latin}
							</span>
						</div>

						<p className='text-slate-300 text-sm leading-relaxed'>
							{result.description}
						</p>

						<div className='flex justify-between items-center pt-3 border-t border-slate-800'>
							<span className='text-xs text-slate-400 font-mono'>
								Дата: {day} {MONTHS[month - 1]}
							</span>
							{result.id > 0 && (
								<a
									href='/map'
									className='bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5'
								>
									<Compass className='w-4 h-4' />
									<span>Открыть на карте</span>
								</a>
							)}
						</div>
					</div>
				)}
			</div>
		</main>
	)
}
