'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest' });
        }
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#030712] text-cyan-400 flex items-center justify-center font-mono">Загрузка дашборда...</div>;
    }

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 p-6 md:p-10 flex flex-col items-center">
            <div className="max-w-4xl w-full">

                {/* Шапка профиля */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl mb-8 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Панель управления (Дашборд)</h1>
                        <p className="text-slate-400 text-sm">
                            Текущий профиль: <span className="text-cyan-400 font-semibold">{user.username}</span> ({user.email})
                        </p>
                    </div>

                    <span className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-950 text-purple-400 border-purple-700' :
                        user.role === 'user' ? 'bg-cyan-950 text-cyan-400 border-cyan-700' :
                            'bg-slate-800 text-slate-300 border-slate-600'
                        }`}>
                        Статус: {user.role === 'admin' ? 'Администратор' : user.role === 'user' ? 'Пользователь' : 'Гость'}
                    </span>
                </div>

                {/* 1. БЛОК ДЛЯ АДМИНИСТРАТОРА */}
                {user.role === 'admin' && (
                    <div className="bg-slate-900/60 border border-purple-500/40 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-purple-400 mb-3">👑 Панель Администратора</h2>
                        <p className="text-slate-300 text-sm mb-6">
                            Вам доступны инструменты редактирования базы данных созвездий, модерация пользователей и просмотр системной статистики.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                                <h3 className="font-semibold text-white mb-1">Управление созвездиями</h3>
                                <p className="text-xs text-slate-400 mb-3">Добавление и редактирование координат звезд в JSON.</p>
                                <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                                    + Добавить объект
                                </button>
                            </div>
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                                <h3 className="font-semibold text-white mb-1">Список пользователей</h3>
                                <p className="text-xs text-slate-400 mb-3">Управление правами доступа и ролями аккаунтов.</p>
                                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition">
                                    Открыть базу users.json
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. БЛОК ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ */}
                {user.role === 'user' && (
                    <div className="bg-slate-900/60 border border-cyan-500/40 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">🔭 Кабинет Исследователя</h2>
                        <p className="text-slate-300 text-sm mb-6">
                            Вы вошли как зарегистрированный пользователь. Вам доступно сохранение избранных созвездий и статистика прохождения космической викторины.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                                <div className="text-2xl font-bold text-cyan-400 mb-1">4</div>
                                <div className="text-xs text-slate-400">Изученных созвездия на карте</div>
                            </div>
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                                <div className="text-2xl font-bold text-amber-400 mb-1">Новичок</div>
                                <div className="text-xs text-slate-400">Ваш текущий ранг астронома</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. БЛОК ДЛЯ НЕАВТОРИЗОВАННОГО ГОСТЯ */}
                {user.role === 'guest' && (
                    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl mb-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-200 mb-3">👀 Гостевой режим</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Вы просматриваете дашборд без авторизации. Вы можете свободно пользоваться картой неба и энциклопедией, но прогресс викторин и настройки не сохраняются.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="/auth/login"
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
                            >
                                Войти в аккаунт
                            </a>
                            <a
                                href="/auth/register"
                                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition border border-slate-700"
                            >
                                Зарегистрироваться
                            </a>
                        </div>
                    </div>
                )}

                {/* Нижняя панель навигации */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                    <a
                        href="/"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition"
                    >
                        ← На главную
                    </a>

                    {user.role !== 'guest' && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('user');
                                setUser({ username: 'Гость', email: 'Не авторизован', role: 'guest' });
                            }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition"
                        >
                            Выйти (перейти в режим гостя)
                        </button>
                    )}
                </div>

            </div>
        </main>
    );
}