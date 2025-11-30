import { useQuery } from '@tanstack/react-query';
import {
    Sparkles, TrendingUp, CheckCircle2, Zap, AlertCircle,
    FileText, Clock, ArrowRight, Activity, PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/stats/dashboard');
            return response.data;
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-700/50 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-700/50 rounded-2xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-slate-700/50 rounded-2xl"></div>
                    <div className="h-80 bg-slate-700/50 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Failed to load dashboard</h3>
                <p className="text-slate-400">
                    {error.response?.data?.detail || 'Something went wrong. Please try again.'}
                </p>
            </div>
        );
    }

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']; // Green, Blue, Yellow, Red

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                    </div>
                    <p className="text-slate-400">Real-time overview of your extraction pipeline.</p>
                </div>
                <div className="text-sm text-slate-500 hidden sm:block">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Extractions"
                    value={stats.summary.total_documents}
                    icon={FileText}
                    color="purple"
                    trend={stats.summary.volume_trend >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(stats.summary.volume_trend)}
                    delay={0}
                />
                <StatsCard
                    title="Success Rate"
                    value={`${stats.summary.success_rate}%`}
                    icon={CheckCircle2}
                    color="green"
                    delay={100}
                />
                <StatsCard
                    title="Avg. Confidence"
                    value={`${stats.summary.avg_confidence}%`}
                    icon={Zap}
                    color="blue"
                    delay={200}
                />
                <StatsCard
                    title="Pending Reviews"
                    value={stats.summary.pending_reviews}
                    icon={AlertCircle}
                    color="orange"
                    delay={300}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Volume Trend Chart */}
                <div className="glass rounded-2xl p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            Extraction Volume
                        </h3>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none focus:border-purple-500">
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.charts.daily_trend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quality Distribution Chart */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-blue-400" />
                        Quality Distribution
                    </h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.charts.quality_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.charts.quality_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-white">{stats.summary.total_documents}</span>
                            <span className="text-xs text-slate-400">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        Recent Activity
                    </h3>
                    <a href="/history" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/10">
                                <th className="pb-4 pl-4 text-sm font-medium text-slate-400">Document</th>
                                <th className="pb-4 text-sm font-medium text-slate-400">Company</th>
                                <th className="pb-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="pb-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="pb-4 text-sm font-medium text-slate-400"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recent_activity.map((item) => (
                                <tr key={item.request_id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-white">
                                                {item.document_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-300">
                                        {item.data.company_name || 'N/A'}
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.quality_grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            item.quality_grade === 'B' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                item.quality_grade === 'C' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            Grade {item.quality_grade}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm text-slate-400">
                                        {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <a
                                            href={`/extraction/${item.request_id}`}
                                            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            View <ArrowRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {stats.recent_activity.length === 0 && (
                                <tr>
                                    <td colspan="5" className="py-8 text-center text-slate-500">
                                        No recent activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
