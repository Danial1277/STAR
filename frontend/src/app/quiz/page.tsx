'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function QuizPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        fetch('http://127.0.0.1:8000/api/quiz')
            .then(res => res.json())
            .then(data => setQuestions(data));

        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = () => {
        fetch('http://127.0.0.1:8000/api/quiz/leaderboard')
            .then(res => res.json())
            .then(data => setLeaderboard(data));
    };

    const handleAnswer = async (selected: string) => {
        const currentQ = questions[currentIndex];
        let newScore = score;
        if (selected === currentQ.answer) {
            newScore += 10;
            setScore(newScore);
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setGameOver(true);
            if (user) {
                await fetch('http://127.0.0.1:8000/api/quiz/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, score: newScore })
                });
                fetchLeaderboard();
            }
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
            <Navbar />
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* Карточка викторины */}
                <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold text-amber-400 mb-6">🚀 Космическая викторина</h1>

                    {questions.length === 0 ? (
                        <p className="text-slate-500">Загрузка вопросов...</p>
                    ) : !gameOver ? (
                        <div>
                            <div className="text-xs text-slate-500 mb-2 font-mono">Вопрос {currentIndex + 1} из {questions.length}</div>
                            <h2 className="text-lg font-semibold text-white mb-6">{questions[currentIndex].question}</h2>
                            <div className="space-y-3">
                                {questions[currentIndex].options.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(opt)}
                                        className="w-full text-left bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl text-slate-200 transition"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h2 className="text-3xl font-bold text-white mb-2">🎉 Викторина завершена!</h2>
                            <p className="text-slate-400 mb-6">Ваш результат: <span className="text-amber-400 font-bold">{score} очков</span></p>
                            <button onClick={() => { setCurrentIndex(0); setScore(0); setGameOver(false); }} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition">
                                Начать заново
                            </button>
                        </div>
                    )}
                </div>

                {/* Таблица лидеров */}
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">🏆 Топ игроков</h3>
                    <div className="space-y-3">
                        {leaderboard.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl text-sm">
                                <span className="font-semibold text-white">{idx + 1}. {item.username}</span>
                                <span className="text-amber-400 font-mono font-bold">{item.score} очков</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}