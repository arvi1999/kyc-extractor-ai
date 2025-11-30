import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { FileText, Calendar, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

export default function History() {
    const [page, setPage] = useState(0);
    const limit = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['history', page],
        queryFn: async () => {
            const response = await api.get(`/history?skip=${page * limit}&limit=${limit}`);
            return response.data;
        },
        keepPreviousData: true
    });

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-6 h-6 text-purple-400" />
                    <h1 className="text-3xl font-bold gradient-text">Extraction History</h1>
                </div>
                <p className="text-slate-400">Browse and analyze your past document extractions</p>
            </div>

            {isLoading ? (
                <div className="glass rounded-2xl p-16 text-center">
                    <div className="inline-block">
                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading your history...</p>
                    </div>
                </div>
            ) : isError ? (
                <div className="glass border border-red-500/50 rounded-2xl p-6 flex items-center gap-3 bg-red-500/5">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                    <p className="text-red-400 font-medium">Failed to load history. Please try again later.</p>
                </div>
            ) : data && data.items.length > 0 ? (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Document
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Quality
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.items.map((item) => (
                                    <tr key={item.request_id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                                    <FileText className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {item.document_type}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        ID: {item.data?.identification_number || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white font-medium">
                                                {item.data?.company_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {item.data?.trade_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Calendar className="h-4 w-4 text-slate-500" />
                                                {new Date(item.uploaded_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full",
                                                item.quality_grade === 'A' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                                    item.quality_grade === 'B' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                            )}>
                                                <TrendingUp className="h-3 w-3" />
                                                {item.quality_grade} ({item.data_quality_score}%)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.data_quality_score >= 80 ? (
                                                <span className="inline-flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                                    <CheckCircle className="h-4 w-4" /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
                                                    <AlertCircle className="h-4 w-4" /> Review
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                        <div className="text-sm text-slate-400">
                            Showing <span className="font-semibold text-white">{page * limit + 1}</span> to{' '}
                            <span className="font-semibold text-white">
                                {Math.min((page + 1) * limit, data.total)}
                            </span>{' '}
                            of <span className="font-semibold text-white">{data.total}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2.5 glass rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="p-2.5 glass rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass rounded-2xl p-16 text-center">
                    <div className="inline-block p-4 rounded-2xl bg-purple-500/10 mb-4">
                        <FileText className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No extractions yet</h3>
                    <p className="text-slate-400 mb-6">Upload your first document to get started</p>
                    <a
                        href="/upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                        Upload Document
                    </a>
                </div>
            )}
        </div>
    );
}
