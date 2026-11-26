'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Map, BookOpen, Calendar, Compass, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function HomePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        const stars = Array.from({ length: 140 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.5 + 0.4,
            alpha: Math.random(),
            speed: (Math.random() - 0.5) * 0.02,
        }));

        const render = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                s.alpha += s.speed;
                if (s.alpha <= 0.15 || s.alpha >= 1) s.speed *= -1;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(186, 230, 253, ${s.alpha})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animId);
    }, []);

    const sections = [
        {
            href: '/map',
            title: 'Интерактивная карта неба',
            description: 'Масштабирование, навигация по звёздам, просмотр спектральных характеристик и схем созвездий.',
            icon: Map,
        },
        {
            href: '/encyclopedia',
            title: 'Энциклопедия созвездий',
            description: 'Каталог созвездий с фильтрацией по временам года, латинскими названиями и описаниями.',
            icon: BookOpen,
        },
        {
            href: '/date-finder',
            title: 'Поиск по дате',
            description: 'Определение созвездия и сезона видимости для любого дня и месяца в году.',
            icon: Calendar,
        },
        {
            href: '/quiz',
            title: 'Астрономическая викторина',
            description: 'Проверка знаний о звёздном небе с сохранением рекордов и таблицей лидеров.',
            icon: Compass,
        },
    ];

    return (
        <main className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden">
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-70" />

            <Navbar />

            <section className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col justify-center">
                <div className="max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400">
                        <span>Интерактивный атлас звёздного неба</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Исследуйте карту созвездий и навигацию по звёздам
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                        Изучайте расположение звёзд на интерактивном холсте, находите созвездия по дате рождения,
                        ведите дневник наблюдений и проверяйте свои знания в викторине.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                            href="/map"
                            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition"
                        >
                            <span>Открыть карту неба</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-6 py-3 rounded-xl text-sm transition"
                        >
                            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                            <span>Личный кабинет и режимы</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-14">
                    {sections.map(({ href, title, description, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-2xl transition backdrop-blur-md flex flex-col justify-between gap-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
                                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}