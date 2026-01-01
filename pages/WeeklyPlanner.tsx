import React, { useState } from 'react';
import { BarChart, MoreHorizontal, Check, Plus, Save, Flag, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WeeklyPlanner: React.FC = () => {
  // Simple state for the demo interactions
  const [tasks, setTasks] = useState([
    { id: 1, title: "Lanzar Campaña de Marketing Q4", category: "Negocios", completed: true, priority: "Alta" },
    { id: 2, title: "Finalizar UI Kit para Cliente X", category: "Creativo", completed: false, priority: "Media", subtasks: 60 },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="md:hidden size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Flag className="w-4 h-4" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Sprint Actual</h2>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Semana 42: Oct 16 - Oct 22</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-medium transition-colors">
                <BarChart className="w-4 h-4" />
                <span>Reportes</span>
             </button>
             <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
             <div className="size-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-white dark:ring-slate-800 shadow-sm"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                  Planificador Semanal
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">
                  Concéntrate en lo esencial. Alinea tus objetivos semanales con tus hábitos principales.
                </p>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 font-medium text-sm hover:border-slate-300 transition-all shadow-sm">
                    Ver Anterior
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Tasks Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Flag className="w-5 h-5 text-primary" />
                   Enfoque de la Semana
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">1/3 Completado</span>
             </div>

             {/* Task List */}
             <div className="flex flex-col gap-4">
                {tasks.map(task => (
                  <div key={task.id} className={`group relative flex flex-col gap-3 p-5 rounded-xl border transition-all duration-200 ${
                    task.completed 
                      ? "bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 opacity-75" 
                      : "bg-white dark:bg-surface-dark border-l-4 border-l-primary border-y-slate-200 border-r-slate-200 dark:border-y-slate-700 dark:border-r-slate-700 shadow-sm hover:shadow-md"
                  }`}>
                      <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                task.category === 'Negocios' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              }`}>{task.category}</span>
                          </div>
                          <button className="text-slate-300 hover:text-slate-500">
                              <MoreHorizontal className="w-5 h-5" />
                          </button>
                      </div>
                      <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className={`flex-shrink-0 size-6 rounded-full flex items-center justify-center transition-all ${
                              task.completed 
                                ? "bg-primary text-white" 
                                : "border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                             {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                          </button>
                          <span className={`text-lg font-medium transition-all ${
                            task.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                          }`}>
                            {task.title}
                          </span>
                      </div>
                      
                      {!task.completed && task.subtasks && (
                         <div className="mt-1 pl-10">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full" style={{width: `${task.subtasks}%`}}></div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{task.subtasks}% Subtareas hechas</p>
                         </div>
                      )}
                  </div>
                ))}

                {/* Empty State / Add New */}
                <button className="group flex items-center gap-4 p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800/50 transition-all text-left">
                    <div className="flex-shrink-0 size-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary/50 flex items-center justify-center">
                       <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <span className="text-lg font-medium text-slate-400 group-hover:text-primary/70">Añadir una tercera prioridad...</span>
                </button>
             </div>
             
             <div className="pt-2">
                 <p className="text-xs md:text-sm text-slate-400 text-center italic">
                   "La clave no es priorizar lo que está en tu agenda, sino programar tus prioridades."
                 </p>
             </div>
          </div>

          {/* Sidebar Stats Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <ArrowUpRight className="w-5 h-5 text-primary" />
                   Consistencia
                </h2>
                <span className="text-sm font-bold text-primary">82% Prom.</span>
             </div>

             <div className="space-y-3">
                <Link to="/tracker" className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all group">
                   <div className="flex items-center gap-4 flex-1">
                      <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                          <Flag className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Salud y Fitness</span>
                              <span className="text-xs font-bold text-slate-500">4/5 Días</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{width: "80%"}}></div>
                          </div>
                      </div>
                   </div>
                </Link>

                <Link to="/tracker" className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all group">
                   <div className="flex items-center gap-4 flex-1">
                      <div className="size-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                          <Check className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Trabajo Profundo</span>
                              <span className="text-xs font-bold text-slate-500">12/15 Horas</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                              <div className="bg-purple-500 h-1.5 rounded-full" style={{width: "75%"}}></div>
                          </div>
                      </div>
                   </div>
                </Link>
             </div>
             
             {/* Insight Card */}
             <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300">
                   <ArrowUpRight className="w-4 h-4" />
                   <h3 className="font-bold text-xs uppercase tracking-wide">Tendencia Semanal</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                   Eres un <span className="font-semibold text-blue-700 dark:text-blue-300">15% más consistente</span> en tus hábitos de Trabajo Profundo comparado con la semana pasada. ¡Sigue así!
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;