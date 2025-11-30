import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, FileText, Calendar, MapPin, ShieldCheck,
    AlertCircle, Clock, CheckCircle, X, Sparkles, Building2,
    Hash, User
} from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function ExtractionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: extraction, isLoading, error } = useQuery({
        queryKey: ['extraction', id],
        queryFn: async () => {
            const response = await api.get(`/extract/${id}`);
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-700/50 rounded-lg"></div>
                <div className="h-64 bg-slate-700/50 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-700/50 rounded-2xl"></div>
                    <div className="h-64 bg-slate-700/50 rounded-2xl"></div>
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
                <h3 className="text-xl font-bold text-white mb-2">Extraction not found</h3>
                <p className="text-slate-400 mb-6">
                    {error.response?.data?.detail || 'The requested extraction could not be loaded.'}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const gradeColors = {
        'A': 'bg-green-500/20 text-green-400 border-green-500/30',
        'B': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'C': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'D': 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">
                                {extraction.data?.company_name || 'Unknown Company'}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300 border border-white/10">
                                {extraction.document_type.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p className="text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Processed on {new Date(extraction.uploaded_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-slate-400 mb-1">Quality Score</p>
                            <div className={clsx(
                                "px-4 py-2 rounded-xl text-lg font-bold border inline-flex items-center gap-2",
                                gradeColors[extraction.quality_grade]
                            )}>
                                <ShieldCheck className="w-5 h-5" />
                                Grade {extraction.quality_grade} ({extraction.data_quality_score}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Extracted Data Card */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Extracted Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trade Name</label>
                                <div className="flex items-center gap-2 text-white font-medium p-3 rounded-xl bg-white/5 border border-white/5">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    {extraction.data?.trade_name || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Identification Number</label>
                                <div className="flex items-center gap-2 text-white font-medium p-3 rounded-xl bg-white/5 border border-white/5">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    {extraction.data?.identification_number || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Issue Date</label>
                                <div className="flex items-center gap-2 text-white font-medium p-3 rounded-xl bg-white/5 border border-white/5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {extraction.data?.issue_date || 'N/A'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approver Name</label>
                                <div className="flex items-center gap-2 text-white font-medium p-3 rounded-xl bg-white/5 border border-white/5">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {extraction.data?.approver_name || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registered Address</label>
                            <div className="flex items-start gap-3 text-white p-4 rounded-xl bg-white/5 border border-white/5">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="space-y-2">
                                    <p className="font-medium leading-relaxed">
                                        {extraction.data?.address?.full_address || 'No address extracted'}
                                    </p>
                                    {extraction.data?.address && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {extraction.data.address.city && (
                                                <span className="px-2 py-1 rounded-md bg-black/20 text-xs text-slate-300">
                                                    {extraction.data.address.city}
                                                </span>
                                            )}
                                            {extraction.data.address.state && (
                                                <span className="px-2 py-1 rounded-md bg-black/20 text-xs text-slate-300">
                                                    {extraction.data.address.state}
                                                </span>
                                            )}
                                            {extraction.data.address.pincode && (
                                                <span className="px-2 py-1 rounded-md bg-black/20 text-xs text-slate-300">
                                                    {extraction.data.address.pincode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Raw Data (Collapsible/Scrollable) */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Raw JSON Response</h2>
                        <div className="bg-black/30 rounded-xl p-4 overflow-auto max-h-64 font-mono text-xs text-slate-300">
                            <pre>{JSON.stringify(extraction.data, null, 2)}</pre>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Insights */}
                    <div className="glass rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            AI Insights
                        </h2>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Model Confidence</span>
                                    <span className="text-white font-medium">{(extraction.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                        style={{ width: `${extraction.confidence * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                                <p className="text-sm text-slate-300 italic leading-relaxed">
                                    "{extraction.confidence_reason}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-400 pt-2 border-t border-white/5">
                                <span>Processing Time</span>
                                <span className="text-white font-mono">{extraction.processing_time_ms}ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Validation Status */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                            Validation Status
                        </h2>

                        <div className="space-y-3">
                            {Object.entries(extraction.validation_results || {}).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-sm text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                                    {val.valid ? (
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                                            <CheckCircle className="h-3 w-3" /> Valid
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                                            <X className="h-3 w-3" /> Invalid
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
