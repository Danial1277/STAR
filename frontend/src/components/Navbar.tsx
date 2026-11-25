'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Sparkles,
    ArrowLeft,
    Map,
    BookOpen,
    Calendar,
    Compass,
    LayoutDashboard,
    User,
    LogIn,
    LogOut,
} from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const navItems = [
        { href: '/map', label: 'Карта', icon: Map },
        { href: '/encyclopedia', label: 'Энциклопедия', icon: BookOpen },
        { href: '/date-finder', label: 'По дате', icon: Calendar },
        { href: '/quiz', label: 'Викторина', icon: Compass },
    ];

    const isHome = pathname === '/';

    return (
        <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3 z-50 sticky top-0">
            <div className="flex items-center gap-3">
                {!isHome && (
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Главная</span>
                    </Link>
                )}

                <Link
                    href="/"
                    className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Созвездия</span>
                </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition border ${active
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50'
                                : 'bg-slate-950/50 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{label}</span>
                        </Link>
                    );
                })}

                <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition border font-semibold ${pathname === '/dashboard'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Кабинет</span>
                </Link>

                {user && user.role !== 'guest' ? (
                    <div className="flex items-center gap-1.5">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono hover:border-slate-700 transition"
                        >
                            <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{user.username}</span>
                            <span className="text-slate-500">[{user.role}]</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            title="Выйти из аккаунта"
                            className="flex items-center gap-1 bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800/60 px-2.5 py-1.5 rounded-xl text-xs transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Выйти</span>
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border border-slate-700"
                    >
                        <LogIn className="w-3.5 h-3.5 shrink-0" />
                        <span>Войти</span>
                    </Link>
                )}
            </nav>
        </header>
    );
}