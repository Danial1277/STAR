'use client';
import { useState } from 'react';

const quizQuestions = [
    {
        question: 'Какое созвездие включает в себя знаменитый астеризм «Большой Ковш»?',
        options: ['Орион', 'Большая Медведица', 'Кассиопея', 'Лебедь'],
        correct: 1,
    },
    {
        question: 'Какая звезда является самой яркой на ночном небе Земли?',
        options: ['Полярная звезда', 'Бетельгейзе', 'Сириус', 'Ригель'],
        correct: 2,
    },
    {
        question: 'По какому характерному элементу легко узнать созвездие Ориона?',
        options: ['Пояс Ориона из трех звезд', 'Форма большого креста', 'Кольцо из туманностей', 'Семь ярких сестер'],
        correct: 0,
    },
];

export default function QuizPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (index: number) => {
        setSelectedOption(index);
    };

    const handleNext = () => {
        if (selectedOption === quizQuestions[currentIndex].correct) {
            setScore(score + 1);
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex < quizQuestions.length) {
            setCurrentIndex(nextIndex);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
        }
    };

    const restartQuiz = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl z-10">
                <div className="flex justify-between items-center mb-6">
                    <a href="/" className="text-slate-400 hover:text-cyan-400 transition text-sm font-semibold">
                        ← На главную
                    </a>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        🚀 Космическая викторина
                    </h1>
                </div>

                {!isFinished ? (
                    <div>
                        <div className="flex justify-between items-center text-xs text-slate-400 mb-4 font-mono">
                            <span>Вопрос {currentIndex + 1} из {quizQuestions.length}</span>
                            <span>Счет: {score}</span>
                        </div>

                        <h2 className="text-lg font-bold text-white mb-6 leading-snug">
                            {quizQuestions[currentIndex].question}
                        </h2>

                        <div className="space-y-3 mb-8">
                            {quizQuestions[currentIndex].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full text-left p-4 rounded-xl border transition text-sm font-medium ${selectedOption === idx
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={selectedOption === null}
                            className={`w-full font-bold py-3 rounded-xl transition shadow-lg ${selectedOption !== null
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {currentIndex + 1 === quizQuestions.length ? 'Завершить тест' : 'Следующий вопрос'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <h2 className="text-2xl font-extrabold text-white mb-3">Викторина завершена! 🎉</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Вы ответили правильно на <span className="text-cyan-400 font-bold">{score}</span> из <span className="font-bold">{quizQuestions.length}</span> вопросов.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={restartQuiz}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/25"
                            >
                                Пройти снова
                            </button>
                            <a
                                href="/"
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition flex items-center justify-center"
                            >
                                На главную
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}