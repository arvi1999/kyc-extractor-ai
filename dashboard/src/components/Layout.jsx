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
    const [collapsed, setCollapsed] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Upload', href: '/upload', icon: Upload },
        { name: 'History', href: '/history', icon: History },
        ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: Users }] : []),
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

            {/* Sidebar - FIXED */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 glass border-r border-white/10 transform transition-all duration-300 ease-in-out lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                collapsed ? "w-20" : "w-72"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo & Hamburger */}
                    <div className={clsx(
                        "flex items-center h-20 border-b border-white/10 px-4",
                        collapsed ? "justify-center" : "justify-between"
                    )}>
                        {/* Logo */}
                        {!collapsed && (
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
                        )}

                        {/* Hamburger Menu - Desktop (RIGHT SIDE) */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none focus:outline-none"
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 outline-none focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Nav - SCROLLABLE */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <div key={item.name} className="relative group">
                                    <Link
                                        to={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 outline-none focus:outline-none",
                                            isActive
                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                                                : "text-slate-400 hover:text-white hover:bg-white/5",
                                            collapsed && "justify-center"
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            "h-5 w-5 transition-transform group-hover:scale-110 flex-shrink-0",
                                            isActive && "drop-shadow-lg"
                                        )} />
                                        {!collapsed && <span>{item.name}</span>}
                                    </Link>
                                    {/* Tooltip for collapsed state */}
                                    {collapsed && (
                                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* User Profile - FIXED AT BOTTOM */}
                    <div className="p-4 border-t border-white/10">
                        {collapsed ? (
                            /* Collapsed User Profile */
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-all outline-none focus:outline-none"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            /* Expanded User Profile */
                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user?.full_name || user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all outline-none focus:outline-none"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={clsx(
                "flex-1 flex flex-col min-w-0 transition-all duration-300",
                collapsed ? "lg:ml-20" : "lg:ml-72"
            )}>
                {/* Mobile Header - FIXED */}
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

                {/* Page Content - SCROLLABLE */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
