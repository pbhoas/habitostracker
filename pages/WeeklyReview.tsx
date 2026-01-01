
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Tooltip } from 'recharts';
import { ArrowUp, Calendar, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
            {trend && (
                <p className="text-green-600 text-sm font-medium flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" /> {trend}
                </p>
            )}
            {subtext && <p className="text-slate-400 text-sm mt-1">{subtext}</p>}
        </div>
    </div>
);

const ChartCard = ({ title, subtitle, data, color }: any) => (
    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-slate-900 dark:text-white text-lg font-bold">{title}</p>
                <p className="text-slate-500 text-sm">{subtitle}</p>
            </div>
        </div>
        <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        dy={10}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.val >= 80 ? '#22c55e' : entry.val >= 50 ? color : '#cbd5e1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const WeeklyReview: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        consistency: 0,
        totalCompleted: 0,
        completionRate: 0,
        bestDay: '',
        dailyData: [] as any[]
    });

    useEffect(() => {
        if (user) fetchWeeklyStats();
    }, [user]);

    const fetchWeeklyStats = async () => {
        try {
            const weekDates = getWeekDates();

            // 1. Fetch habits to know schedule
            const { data: habits } = await supabase.from('habits').select('*');

            if (!habits) return;

            // 2. Fetch logs for this week
            const { data: logs } = await supabase
                .from('habit_logs')
                .select('*')
                .gte('completed_at', weekDates[0])
                .lte('completed_at', weekDates[6]);

            // Calculate Daily Stats
            const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
            const dailyStats = weekDates.map((date, index) => {
                // How many habits scheduled for this day index (0=Mon, 6=Sun)?
                // habits[].schedule.days is [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
                const scheduledCount = habits.reduce((acc, h) => acc + (h.schedule?.days?.[index] ? 1 : 0), 0);
                const completedCount = logs?.filter(l => l.completed_at === date).length || 0;

                const percent = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

                return {
                    name: days[index],
                    val: percent,
                    count: completedCount,
                    scheduled: scheduledCount
                };
            });

            // Aggregate
            const totalScheduled = dailyStats.reduce((acc, d) => acc + d.scheduled, 0);
            const totalCompleted = dailyStats.reduce((acc, d) => acc + d.count, 0);
            const consistency = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

            // Find best day
            const bestDayObj = [...dailyStats].sort((a, b) => b.val - a.val)[0];
            const bestDay = bestDayObj?.val > 0 ? `El ${bestDayObj.name} es tu mejor día` : 'Sin datos suficientes';

            setStats({
                consistency,
                totalCompleted,
                completionRate: consistency,
                bestDay,
                dailyData: dailyStats
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                        <Calendar className="w-4 h-4" />
                        <span>Esta Semana</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Revisión Semanal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mt-1">
                        Tu consistencia esta semana es del <span className="text-primary font-bold">{stats.consistency}%</span>.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard title="Consistencia Total" value={`${stats.consistency}%`} trend={stats.consistency > 50 ? "Buena" : undefined} icon={ArrowUp} />
                <StatCard title="Hábitos Hechos" value={stats.totalCompleted.toString()} icon={CheckCircle} />
                {/* Using mock values for Focus/Streak as they are not yet tracked */}
                <StatCard title="Puntos Clave" value={stats.dailyData.filter(d => d.val === 100).length} subtext="Días perfectos" icon={Clock} />
                <StatCard title="Mejor Día" value={stats.dailyData.sort((a, b) => b.val - a.val)[0]?.name} subtext="Mayor cumplimiento" icon={Calendar} />
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rendimiento Diario</h3>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                <ChartCard
                    title="Cumplimiento Diario"
                    subtitle="Porcentaje de hábitos completados"
                    data={stats.dailyData}
                    color="#3b82f6"
                />
            </div>

            {/* Insight Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-gradient-to-br from-primary to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-90">
                                <span className="text-xl">💡</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Insight Semanal</span>
                            </div>
                            <p className="text-lg font-medium leading-relaxed opacity-95">
                                {stats.bestDay || "Sigue registrando tus hábitos para ver insights."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WeeklyReview;