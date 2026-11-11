'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
    const [constellations, setConstellations] = useState<any[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Загрузка данных с бэкенда
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/constellations')
            .then((res) => res.json())
            .then((data) => setConstellations(data))
            .catch((err) => console.error('Ошибка загрузки данных:', err));
    }, []);

    // Анимация космоса и реагирование на движение мыши
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Координаты мыши
        let mouse = { x: width / 2, y: height / 2 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Создаем массив звезд для анимации фона
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random(),
            vAlpha: (Math.random() - 0.5) * 0.02,
        }));

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Смещение центра под движение мыши (параллакс)
            const dx = (mouse.x - width / 2) * 0.03;
            const dy = (mouse.y - height / 2) * 0.03;

            stars.forEach((star) => {
                star.x += star.vx;
                star.y += star.vy;
                star.alpha += star.vAlpha;

                if (star.alpha <= 0.1 || star.alpha >= 1) star.vAlpha *= -1;
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;

                ctx.beginPath();
                ctx.arc(star.x + dx * star.radius, star.y + dy * star.radius, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Интерактивный анимированный фон (Canvas) */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

            {/* Фоновые градиенты */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

            <div className="max-w-4xl w-full text-center z-10 relative">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 tracking-tight drop-shadow-lg">
                    ✨ Интерактивная энциклопедия звёздного неба
                </h1>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                    Исследуйте расширенную карту космоса, находите созвездия по дате рождения и проверяйте свои знания в викторине.
                </p>

                {/* Навигационные кнопки */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <a
                        href="/map"
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                    >
                        🗺️ Карта неба
                    </a>
                    <a
                        href="/encyclopedia"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center gap-2"
                    >
                        📖 Энциклопедия
                    </a>
                    <a
                        href="/date-finder"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/25 flex items-center gap-2"
                    >
                        📅 Созвездие по дате
                    </a>
                    <a
                        href="/quiz"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-amber-600/25 flex items-center gap-2"
                    >
                        🚀 Викторина
                    </a>
                    <a
                        href="/auth/login"
                        className="border border-slate-700 hover:border-cyan-500 bg-slate-900/60 backdrop-blur-md text-slate-200 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
                    >
                        👤 Профиль
                    </a>
                </div>

                {/* Секция данных с бэкенда */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 text-left shadow-2xl">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                        🌌 База космических объектов ({constellations.length} созвездия):
                    </h2>
                    {constellations.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-slate-500 text-sm animate-pulse">
                            Загрузка базы данных FastAPI...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {constellations.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-cyan-500/50 transition group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition">
                                            {item.name}
                                        </h3>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
                                            {item.latin}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{item.description}</p>
                                    <div className="text-xs text-slate-500 flex justify-between border-t border-slate-800/80 pt-2 font-mono">
                                        <span>Сезон: {item.season}</span>
                                        <span>Звезд в базе: {item.stars?.length || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}