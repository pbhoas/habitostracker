
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Zap, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CalendarDay = ({ day, status }: { day: number, status?: 'high' | 'medium' | 'low' | 'none' }) => {
    const getBg = () => {
        switch (status) {
            case 'high': return 'bg-primary border-primary';
            case 'medium': return 'bg-primary/60 border-primary/60';
            case 'low': return 'bg-primary/30 border-primary/30';
            default: return 'bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-800';
        }
    };

    return (
        <div className={`aspect-square rounded-lg border ${getBg()} flex items-center justify-center relative group transition-all hover:scale-105`}>
            <span className={`text-xs font-bold ${status === 'none' || !status ? 'text-slate-400' : 'text-white'}`}>{day}</span>
        </div>
    );
};

const getMonthData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const emptySlots = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    return {
        year,
        month,
        numDays,
        emptySlots,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
        monthName: firstDay.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    };
};

const MonthlyReview: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [monthInfo, setMonthInfo] = useState(getMonthData());
    const [dayStats, setDayStats] = useState<Map<number, string>>(new Map());
    const [summary, setSummary] = useState({
        score: 0,
        activeDays: 0,
        totalActiveDays: 0,
        totalHabits: 0
    });

    useEffect(() => {
        if (user) fetchMonthlyStats();
    }, [user]);

    const fetchMonthlyStats = async () => {
        try {
            const { startDate, endDate, numDays } = monthInfo;

            const { data: habits } = await supabase.from('habits').select('*');
            if (!habits) return;

            const { data: logs } = await supabase
                .from('habit_logs')
                .select('*')
                .gte('completed_at', startDate)
                .lte('completed_at', endDate);

            const statsMap = new Map<number, string>();
            let totalScheduled = 0;
            let totalCompleted = 0;
            let daysActiveCount = 0;

            // Process each day of the month
            for (let d = 1; d <= numDays; d++) {
                const dateObj = new Date(monthInfo.year, monthInfo.month, d);
                const dateStr = dateObj.toISOString().split('T')[0];
                const dayOfWeek = dateObj.getDay(); // 0=Sun...
                // Adjust to 0=Mon, 6=Sun if needed, but habits.schedule uses logic? 
                // Logic in HabitTracker was: habits.schedule.days[0] -> Monday? 
                // Wait, HabitTracker header implied L,M,X,J,V,S,D mapping to indices 0-6.
                // Standard `getDay()` returns 0=Sunday.
                // Let's assume indices in `days` array are 0=Mon, 1=Tue ... 6=Sun.
                const jsDay = dateObj.getDay();
                const scheduleIndex = jsDay === 0 ? 6 : jsDay - 1;

                // Count scheduled
                const scheduledForDay = habits.reduce((acc, h) => acc + (h.schedule?.days?.[scheduleIndex] ? 1 : 0), 0);

                // Count completed
                const completedForDay = logs?.filter(l => l.completed_at === dateStr).length || 0;

                totalScheduled += scheduledForDay;
                totalCompleted += completedForDay;
                if (completedForDay > 0) daysActiveCount++;

                let status: 'none' | 'low' | 'medium' | 'high' = 'none';
                if (scheduledForDay > 0) {
                    const ratio = completedForDay / scheduledForDay;
                    if (ratio >= 0.8) status = 'high';
                    else if (ratio >= 0.5) status = 'medium';
                    else if (ratio > 0) status = 'low';
                }
                statsMap.set(d, status);
            }

            setDayStats(statsMap);
            setSummary({
                score: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
                activeDays: daysActiveCount,
                totalActiveDays: numDays,
                totalHabits: habits.length
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const daysArray = Array.from({ length: monthInfo.numDays }, (_, i) => i + 1);
    const emptySlotsArray = Array.from({ length: monthInfo.emptySlots }, (_, i) => i);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-500">
                        <button className="hover:text-primary transition-colors p-1 bg-slate-100 dark:bg-slate-800 rounded-md"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-bold uppercase tracking-wider capitalize">{monthInfo.monthName}</span>
                        <button className="hover:text-primary transition-colors p-1 bg-slate-100 dark:bg-slate-800 rounded-md"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resumen Mensual</h2>
                </div>
                <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-primary px-6 font-medium text-white transition-all hover:bg-primary-dark shadow-md shadow-primary/20">
                    <Calendar className="mr-2 w-4 h-4" />
                    <span>Planificar Siguiente</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-500">Puntuación</span>
                        <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{summary.score}%</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-500">Días Activos</span>
                        <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{summary.activeDays}</span>
                        <span className="text-sm text-slate-400">/ {summary.totalActiveDays}</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-500">Hábitos Tracker</span>
                        <Trophy className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{summary.totalHabits}</span>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-500">Hito</span>
                        <Star className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Constante</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Calendar Visualization */}
                <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-surface-dark p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Consistencia Diaria</h3>
                        <p className="text-sm text-slate-500">Visualizando tus sesiones de enfoque de este mes.</p>
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-7 gap-3 mb-3">
                            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                                <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {/* Empty slots for start of month */}
                            {emptySlotsArray.map(i => <div key={`empty-${i}`} className="aspect-square"></div>)}

                            {/* Days */}
                            {daysArray.map(day => (
                                <CalendarDay
                                    key={day}
                                    day={day}
                                    status={dayStats.get(day) as any}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wins Column */}
                <div className="space-y-6">
                    <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-sm border border-slate-100 dark:bg-surface-dark dark:from-surface-dark dark:to-surface-dark dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Victorias del Mes</h3>
                        </div>
                        {/* Placeholder for wins logic as it's not DB connected yet in this iteration */}
                        <div className="space-y-6">
                            <p className="text-slate-500 text-sm italic">Registra tus victorias diarias para verlas aquí.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MonthlyReview;