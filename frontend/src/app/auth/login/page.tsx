'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || 'Неверный логин или пароль');
                return;
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } catch (err) {
            setError('Ошибка соединения с сервером. Проверьте, запущен ли FastAPI.');
        }
    };

    const continueAsGuest = () => {
        localStorage.removeItem('user');
        router.push('/dashboard');
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
                <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Вход в аккаунт</h1>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                            placeholder="mail@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Пароль</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/25"
                    >
                        Войти
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
                    <button
                        onClick={continueAsGuest}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl transition border border-slate-700"
                    >
                        👀 Войти как Гость (без регистрации)
                    </button>
                    <p className="text-center text-sm text-slate-400">
                        Нет аккаунта? <a href="/auth/register" className="text-cyan-400 hover:underline">Зарегистрироваться</a>
                    </p>
                </div>
            </div>
        </main>
    );
}