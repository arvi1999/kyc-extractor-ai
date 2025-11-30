import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { FileText, Calendar, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Extraction History</h1>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading history...</p>
                </div>
            ) : isError ? (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    Failed to load history. Please try again later.
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Document
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Quality
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {data.items.map((item) => (
                                    <tr key={item.request_id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {item.document_type}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {item.data?.identification_number || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">
                                                {item.data?.company_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.data?.trade_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-300">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                {new Date(item.uploaded_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={clsx(
                                                "px-2 py-1 text-xs font-bold rounded-full",
                                                item.quality_grade === 'A' ? "bg-green-500/20 text-green-400" :
                                                    item.quality_grade === 'B' ? "bg-blue-500/20 text-blue-400" :
                                                        "bg-yellow-500/20 text-yellow-400"
                                            )}>
                                                Grade {item.quality_grade} ({item.data_quality_score}%)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.data_quality_score >= 80 ? (
                                                <span className="flex items-center text-green-400 text-sm">
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-yellow-400 text-sm">
                                                    <AlertCircle className="h-4 w-4 mr-1" /> Review
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Showing <span className="font-medium text-white">{page * limit + 1}</span> to{' '}
                            <span className="font-medium text-white">
                                {Math.min((page + 1) * limit, data.total)}
                            </span>{' '}
                            of <span className="font-medium text-white">{data.total}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
