import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Upload,
    History,
    Users,
    LogOut,
    Menu,
    X,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Upload', href: '/upload', icon: Upload },
        { name: 'History', href: '/history', icon: History },
        { name: 'Users', href: '/users', icon: Users },
    ];

    return (
        <div className="min-h-screen flex relative">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 glow">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-bold gradient-text">KYC Extractor</span>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Sparkles className="w-3 h-3" />
                                    AI Powered
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={clsx(
                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                        isActive && "drop-shadow-lg"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/10">
                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden glass border-b border-white/10 sticky top-0 z-30">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold gradient-text">KYC Extractor</span>
                        </div>
                        <div className="w-6" />
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
