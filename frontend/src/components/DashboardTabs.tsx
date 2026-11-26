'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Sparkles,
    HelpCircle,
    Award,
    NotebookPen,
} from 'lucide-react';

interface DashboardTabsProps {
    role: string;
}

export default function DashboardTabs({ role }: DashboardTabsProps) {
    const pathname = usePathname();

    const adminNav = [
        { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
        { href: '/dashboard/encyclopedia', label: 'Энциклопедия', icon: BookOpen },
        { href: '/dashboard/users', label: 'Пользователи', icon: Users },
        { href: '/admin/stars', label: 'Звёзды', icon: Sparkles },
        { href: '/admin/quiz', label: 'Викторина', icon: HelpCircle },
    ];

    const userNav = [
        { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
        { href: '/dashboard/progress', label: 'Прогресс', icon: Award },
        { href: '/dashboard/notes', label: 'Дневник', icon: NotebookPen },
    ];

    const items = role === 'admin' ? adminNav : role === 'user' ? userNav : [];

    if (items.length === 0) return null;

    return (
        <nav className="bg-slate-900/85 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center gap-2 shadow-lg">
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${isActive
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}