'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardTabs from '@/components/DashboardTabs';
import {
	Shield,
	User,
	Eye,
	LogOut,
	BookOpen,
	Users,
	Sparkles,
	HelpCircle,
	Award,
	NotebookPen,
	ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem('user');
		if (stored) {
			try {
				setUser(JSON.parse(stored));
			} catch {
				setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
			}
		} else {
			setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
		}
		setIsLoaded(true);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('user');
		setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest', score: 0 });
		router.push('/');
	};

	if (!isLoaded || !user) {
		return <div className="min-h-screen bg-[#030712] text-cyan-400 flex items-center justify-center font-mono">Загрузка кабинета...</div>;
	}

	const currentRole = user.role || 'guest';

	return (
		<main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
			<Navbar />

			<div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
				<div className="bg-slate-900/85 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
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
								{currentRole === 'admin' ? 'Администратор' : currentRole === 'user' ? 'Пользователь' : 'Гость'}
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

				<DashboardTabs role={currentRole} />

				{currentRole === 'admin' && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link
							href="/dashboard/encyclopedia"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
									<BookOpen className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Энциклопедия</h2>
									<p className="text-xs text-slate-400 mt-0.5">Сортировка названий, редактирование и удаление созвездий</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>

						<Link
							href="/dashboard/users"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
									<Users className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Пользователи</h2>
									<p className="text-xs text-slate-400 mt-0.5">Сортировка имён, статистика и смена почты и пароля</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>

						<Link
							href="/admin/stars"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
									<Sparkles className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Звёзды</h2>
									<p className="text-xs text-slate-400 mt-0.5">Конструктор звёзд и связей на карте созвездий</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>

						<Link
							href="/admin/quiz"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/60">
									<HelpCircle className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Викторина</h2>
									<p className="text-xs text-slate-400 mt-0.5">Создание, редактирование и удаление вопросов викторины</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>
					</div>
				)}

				{currentRole === 'user' && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link
							href="/dashboard/progress"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
									<Award className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Прогресс</h2>
									<p className="text-xs text-slate-400 mt-0.5">Изученные созвездия и избранное</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>

						<Link
							href="/dashboard/notes"
							className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 p-5 rounded-2xl transition flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3.5">
								<div className="p-3 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
									<NotebookPen className="w-5 h-5" />
								</div>
								<div>
									<h2 className="font-bold text-white text-base">Дневник</h2>
									<p className="text-xs text-slate-400 mt-0.5">Заметки наблюдений за звёздным небом</p>
								</div>
							</div>
							<ArrowRight className="w-4 h-4 text-slate-400" />
						</Link>
					</div>
				)}

				{currentRole === 'guest' && (
					<div className="bg-slate-900/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
						<h2 className="text-xl font-bold text-white">Гостевой режим</h2>
						<p className="text-slate-400 text-sm">
							Вы просматриваете сайт как гость. Войдите или зарегистрируйтесь, чтобы сохранять прогресс и заметки наблюдений.
						</p>
						<div className="flex flex-wrap gap-3 pt-2">
							<Link href="/auth/login" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition">
								Войти в аккаунт
							</Link>
							<Link href="/auth/register" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
								Регистрация
							</Link>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}