import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "purple", delay = 0 }) {
    const isPositive = trend === 'up';

    const colorStyles = {
        purple: "from-purple-500 to-indigo-600 shadow-purple-500/20",
        blue: "from-blue-500 to-cyan-600 shadow-blue-500/20",
        green: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
        orange: "from-orange-500 to-red-600 shadow-orange-500/20",
        pink: "from-pink-500 to-rose-600 shadow-pink-500/20"
    };

    const iconBgStyles = {
        purple: "bg-purple-500/20 text-purple-400",
        blue: "bg-blue-500/20 text-blue-400",
        green: "bg-emerald-500/20 text-emerald-400",
        orange: "bg-orange-500/20 text-orange-400",
        pink: "bg-pink-500/20 text-pink-400"
    };

    return (
        <div
            className="glass rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconBgStyles[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}%
                    </div>
                )}
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-white tracking-tight group-hover:tracking-normal transition-all duration-300">
                {value}
            </div>

            {/* Decorative gradient glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${colorStyles[color]} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity duration-500`}></div>
        </div>
    );
}
