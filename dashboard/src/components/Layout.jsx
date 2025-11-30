import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Upload,
    History,
    Users,
    LogOut,
    Menu,
    X
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
    ];

    // Add Users link for admins (decoding token would be better, but simple check for now)
    // In a real app, we'd decode the JWT to check the role
    // For now, let's just show it, and the backend will block access if unauthorized
    // Or we can store role in AuthContext

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                        <span className="text-xl font-bold text-white">KYC Extractor</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        <Link
                            to="/users"
                            className={clsx(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                location.pathname === '/users'
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            )}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            Users
                        </Link>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white truncate w-32">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-72">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-white">KYC Extractor</span>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
