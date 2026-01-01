
import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Dumbbell, Brain, Coffee, Book, ArrowUpRight, Activity, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Icon mapping
const ICON_MAP: Record<string, any> = {
    'Brain': Brain,
    'Dumbbell': Dumbbell,
    'Coffee': Coffee,
    'Book': Book,
    'Activity': Activity,
    'Check': Check
};

interface Habit {
    id: string;
    title: string;
    subtitle: string;
    icon: any; // Component
    iconName: string; // for DB
    color: string;
    days: boolean[];
    checkedDays: boolean[];
}

const HabitCard = ({ id, icon: Icon, color, title, subtitle, days, checkedDays, onToggle }: any) => {
    // Calculate progress dynamically
    const totalScheduled = days.filter(Boolean).length;
    const totalChecked = checkedDays.filter((c: boolean, i: number) => c && days[i]).length;
    const progress = totalScheduled === 0 ? 0 : Math.round((totalChecked / totalScheduled) * 100);

    return (
        <div className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle} • {progress}% Compl.</p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            {/* Grid Header */}
            <div className="grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] gap-2 mb-3 px-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Hábito</div>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
                ))}
            </div>

            <div className="space-y-3">
                {/* Row 1 */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                    <div className="grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] gap-2 items-center">
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate pr-2">Principal</span>
                        {days.map((isActive: boolean, i: number) => {
                            const isChecked = checkedDays[i];
                            return (
                                <div key={i} className="flex justify-center">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={!isActive}
                                        onChange={() => isActive && onToggle(id, i)}
                                        className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors duration-200 appearance-none flex items-center justify-center
                                            ${isActive
                                                ? isChecked
                                                    ? 'bg-primary border-primary'
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary'
                                                : 'bg-slate-100 dark:bg-slate-800 border-transparent cursor-not-allowed opacity-50'
                                            }
                                        `}
                                        style={{
                                            backgroundImage: isChecked ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none',
                                            backgroundSize: '100% 100%',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to get current week dates (Mon-Sun)
const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const HabitTracker: React.FC = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState("");
    const [inputTitle, setInputTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const [habits, setHabits] = useState<Habit[]>([]);
    const weekDates = getWeekDates();

    useEffect(() => {
        if (user) {
            fetchHabits();
        }
    }, [user]);

    const fetchHabits = async () => {
        try {
            setLoading(true);
            // 1. Fetch habits
            const { data: habitsData, error: habitsError } = await supabase
                .from('habits')
                .select('*')
                .order('created_at', { ascending: true });

            if (habitsError) throw habitsError;

            // 2. Fetch logs for this week
            const { data: logsData, error: logsError } = await supabase
                .from('habit_logs')
                .select('*')
                .gte('completed_at', weekDates[0])
                .lte('completed_at', weekDates[6]);

            if (logsError) throw logsError;

            // Process logs into a map: habitId -> Set of dates
            const logsMap = new Map<string, Set<string>>();
            logsData?.forEach(log => {
                if (!logsMap.has(log.habit_id)) {
                    logsMap.set(log.habit_id, new Set());
                }
                logsMap.get(log.habit_id)?.add(log.completed_at);
            });

            // Transform to internal state
            const loadedHabits: Habit[] = habitsData.map(h => {
                const datesMap = logsMap.get(h.id);
                const checkedDays = weekDates.map(date => datesMap?.has(date) || false);

                return {
                    id: h.id,
                    title: h.title,
                    subtitle: h.subtitle || "Personal",
                    icon: ICON_MAP[h.icon] || Activity,
                    iconName: h.icon,
                    color: h.color || "bg-blue-50 text-blue-600",
                    days: h.schedule?.days || [true, true, true, true, true, true, true],
                    checkedDays
                };
            });

            setHabits(loadedHabits);
        } catch (error) {
            console.error("Error loading habits:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = async (habitId: string, dayIndex: number) => {
        const dateStr = weekDates[dayIndex];
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const isChecked = habit.checkedDays[dayIndex];

        // Optimistic Update
        setHabits(prev => prev.map(h => {
            if (h.id === habitId) {
                const newChecked = [...h.checkedDays];
                newChecked[dayIndex] = !newChecked[dayIndex];
                return { ...h, checkedDays: newChecked };
            }
            return h;
        }));

        try {
            if (isChecked) {
                // Delete log
                await supabase.from('habit_logs')
                    .delete()
                    .eq('habit_id', habitId)
                    .eq('completed_at', dateStr);
            } else {
                // Insert log
                await supabase.from('habit_logs')
                    .insert({
                        habit_id: habitId,
                        completed_at: dateStr
                    });
            }
        } catch (error) {
            console.error("Error toggling habit:", error);
            // Revert on error (could be implemented)
        }
    };

    const handleAddHabit = async () => {
        if (!newHabitName.trim() || !user) return;

        const newHabitData = {
            user_id: user.id,
            title: newHabitName,
            subtitle: "Personalizado",
            icon: "Activity", // Default
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", // Default
            schedule: { days: [true, true, true, true, true, true, true] }
        };

        try {
            const { data, error } = await supabase.from('habits').insert(newHabitData).select().single();

            if (error) throw error;

            const newHabit: Habit = {
                id: data.id,
                title: data.title,
                subtitle: data.subtitle,
                icon: Activity,
                iconName: data.icon,
                color: data.color,
                days: data.schedule.days,
                checkedDays: [false, false, false, false, false, false, false]
            };

            setHabits([...habits, newHabit]);
            setNewHabitName("");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating habit:", error);
        }
    };

    // Stats Calculations
    const totalHabits = habits.length;
    const totalOpportunities = habits.reduce((acc, h) => acc + h.days.filter(Boolean).length, 0);
    const totalCompleted = habits.reduce((acc, h) => acc + h.checkedDays.filter((c, i) => c && h.days[i]).length, 0);
    const successRate = totalOpportunities > 0 ? Math.round((totalCompleted / totalOpportunities) * 100) : 0;

    if (loading) {
        return <div className="min-h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="min-h-full flex flex-col relative">
            {/* Header */}
            <header className="px-6 py-8 bg-background-light dark:bg-background-dark">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </p>
                            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                                Hola, {user?.email?.split('@')[0]}
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary-dark text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>Nuevo Hábito</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-0">
                        <div className="flex gap-8">
                            <button className="relative pb-4 text-primary font-semibold text-sm">
                                Esta Semana
                                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>
                            </button>
                            <button className="pb-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium text-sm transition-colors">
                                Semana Pasada
                            </button>
                        </div>
                        <div className="hidden md:flex items-center gap-4 pb-3">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Consistencia Semanal</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{successRate}%</p>
                            </div>
                            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${successRate}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-6xl mx-auto px-6 pb-12">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Hábitos</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalHabits}</p>
                        </div>
                        <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Book className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completados</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCompleted}</p>
                        </div>
                        <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                            <div className="text-xl">🔥</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tasa de Éxito</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{successRate}%</p>
                        </div>
                        <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Habit Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {habits.map(habit => (
                        <HabitCard
                            key={habit.id}
                            id={habit.id}
                            icon={habit.icon}
                            color={habit.color}
                            title={habit.title}
                            subtitle={habit.subtitle}
                            days={habit.days}
                            checkedDays={habit.checkedDays}
                            onToggle={toggleDay}
                        />
                    ))}
                </div>
            </div>

            {/* Add Habit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nuevo Hábito</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre del Hábito</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newHabitName}
                                        onChange={(e) => setNewHabitName(e.target.value)}
                                        placeholder="Ej. Meditación, Leer 30min..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddHabit}
                                        disabled={!newHabitName.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Crear Hábito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;