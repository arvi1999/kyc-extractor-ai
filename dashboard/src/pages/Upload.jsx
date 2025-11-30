import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setResults(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 10
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        setResults(null);

        try {
            if (files.length === 1) {
                const formData = new FormData();
                formData.append('file', files[0]);
                const response = await api.post('/extract', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setResults([response.data]);
            } else {
                const formData = new FormData();
                files.forEach(file => {
                    formData.append('files', file);
                });
                const response = await api.post('/extract/batch', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setResults(response.data.results);
            }
            setFiles([]);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-6 h-6 text-purple-400" />
                    <h1 className="text-3xl font-bold gradient-text">Upload Documents</h1>
                </div>
                <p className="text-slate-400">Extract company details using AI-powered document intelligence</p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={clsx(
                    "glass border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden",
                    isDragActive
                        ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                        : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
                )}
            >
                <input {...getInputProps()} />

                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                        <UploadIcon className="h-10 w-10 text-purple-400" />
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">
                        {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                    </p>
                    <p className="text-slate-400">
                        or click to browse • PDF, PNG, JPG (Max 10 files)
                    </p>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Selected Files ({files.length})
                        </h3>
                        <button
                            onClick={() => setFiles([])}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {files.map((file, index) => (
                            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <FileText className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <span className="text-white font-medium">{file.name}</span>
                                        <span className="ml-3 text-slate-400 text-sm">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Extract from {files.length} Document{files.length > 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="glass border border-red-500/50 rounded-2xl p-4 flex items-center gap-3 bg-red-500/5">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Extraction Results
                    </h2>
                    {results.map((result, idx) => (
                        <div key={idx} className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all">
                            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {result.data?.company_name || 'Unknown Company'}
                                    </h3>
                                    <p className="text-slate-400 flex items-center gap-2">
                                        <span>{result.document_type}</span>
                                        <span className="text-white/20">•</span>
                                        <span>ID: {result.data?.identification_number || 'N/A'}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5",
                                        result.quality_grade === 'A' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                            result.quality_grade === 'B' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                                "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    )}>
                                        Grade {result.quality_grade} ({result.data_quality_score}%)
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        Confidence: {(result.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Extracted Data */}
                                <div className="glass rounded-xl p-5">
                                    <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
                                        Extracted Details
                                    </h4>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-400">Trade Name:</dt>
                                            <dd className="text-white font-medium">{result.data?.trade_name || '-'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-400">Date:</dt>
                                            <dd className="text-white font-medium">{result.data?.issue_date || '-'}</dd>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <dt className="text-slate-400 mb-2">Address:</dt>
                                            <dd className="text-white bg-black/20 p-3 rounded-lg text-xs leading-relaxed">
                                                {result.data?.address?.full_address || 'No address extracted'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Validation */}
                                <div className="glass rounded-xl p-5">
                                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4">
                                        Validation Status
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(result.validation_results || {}).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between text-sm bg-black/20 p-3 rounded-lg">
                                                <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                                                {val.valid ? (
                                                    <span className="flex items-center gap-1.5 text-green-400">
                                                        <CheckCircle className="h-4 w-4" /> Valid
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-red-400">
                                                        <X className="h-4 w-4" /> Invalid
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
