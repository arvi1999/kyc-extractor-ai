import { Sparkles, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        {
            label: 'Total Extractions',
            value: '0',
            change: '+0%',
            icon: Zap,
            color: 'from-purple-500 to-pink-500'
        },
        {
            label: 'Average Score',
            value: '0%',
            change: '+0%',
            icon: TrendingUp,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Success Rate',
            value: '0%',
            change: '+0%',
            icon: CheckCircle2,
            color: 'from-green-500 to-emerald-500'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                </div>
                <p className="text-slate-400">Welcome back! Here's your overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer transform hover:scale-[1.02]"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                            </div>
                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="/upload"
                        className="glass-hover rounded-xl p-4 flex items-center gap-4 group cursor-pointer"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                Upload Documents
                            </p>
                            <p className="text-sm text-slate-400">Extract KYC data instantly</p>
                        </div>
                    </a>
                    <a
                        href="/history"
                        className="glass-hover rounded-xl p-4 flex items-center gap-4 group cursor-pointer"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                View History
                            </p>
                            <p className="text-sm text-slate-400">Browse past extractions</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="glass rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        🎉 Welcome to KYC Extractor
                    </h2>
                    <p className="text-slate-300 mb-4">
                        Start by uploading your first document or explore your extraction history.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="/upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                        >
                            <Sparkles className="w-4 h-4" />
                            Get Started
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
