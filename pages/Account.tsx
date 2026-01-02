
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Save, AlertCircle, Check } from 'lucide-react';

const Account: React.FC = () => {
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user && user.user_metadata) {
            setFullName(user.user_metadata.full_name || '');
            setAge(user.user_metadata.age || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error, data } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    age: age
                }
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

            // Force reload to update context if needed or just wait for session refresh
            // Ideally context updates automatically if we used refreshSession, but a reload ensures it for now
            // or we could just let the user see the success message.
            // The Greeting on other pages will update on navigation if the session is refreshed.
            // Let's manually refresh the session to be sure without reload if possible, 
            // but supabase.auth.refreshSession() is the way.
            await supabase.auth.refreshSession();

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Mi Cuenta</h1>
                <p className="text-slate-500 dark:text-slate-400">Gestiona tu información personal</p>
            </header>

            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Nombre Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Edad
                            </label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                placeholder="Tu edad"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                {!loading && <Save className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Account;
