import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setResults(null); // Reset results on new file add
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
                // Single File Upload
                const formData = new FormData();
                formData.append('file', files[0]);

                const response = await api.post('/extract', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setResults([response.data]);
            } else {
                // Batch Upload
                const formData = new FormData();
                files.forEach(file => {
                    formData.append('files', file);
                });

                const response = await api.post('/extract/batch', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setResults(response.data.results);
            }
            setFiles([]); // Clear files after successful upload
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Upload Documents</h1>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={clsx(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
                    isDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-500 bg-gray-800"
                )}
            >
                <input {...getInputProps()} />
                <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-white">
                    {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, PNG, JPG (Max 10 files)
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-medium">Selected Files ({files.length})</h3>
                        <button
                            onClick={() => setFiles([])}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            Clear All
                        </button>
                    </div>
                    <ul className="divide-y divide-gray-700">
                        {files.map((file, index) => (
                            <li key={index} className="px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-300 text-sm">{file.name}</span>
                                    <span className="ml-2 text-gray-500 text-xs">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="px-6 py-4 bg-gray-800/50">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                `Extract Data from ${files.length} Document${files.length > 1 ? 's' : ''}`
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h2 className="text-xl font-bold text-white">Extraction Results</h2>
                    {results.map((result, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {result.data?.company_name || 'Unknown Company'}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {result.document_type} • ID: {result.data?.identification_number || 'N/A'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-sm font-bold flex items-center",
                                        result.quality_grade === 'A' ? "bg-green-500/20 text-green-400" :
                                            result.quality_grade === 'B' ? "bg-blue-500/20 text-blue-400" :
                                                "bg-yellow-500/20 text-yellow-400"
                                    )}>
                                        Grade {result.quality_grade} ({result.data_quality_score}%)
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        Confidence: {(result.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Extracted Data */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Extracted Details
                                    </h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-400">Trade Name:</dt>
                                            <dd className="text-white text-right">{result.data?.trade_name || '-'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-400">Date:</dt>
                                            <dd className="text-white text-right">{result.data?.issue_date || '-'}</dd>
                                        </div>
                                        <div className="mt-2">
                                            <dt className="text-gray-400 mb-1">Address:</dt>
                                            <dd className="text-white bg-gray-900 p-2 rounded text-xs">
                                                {result.data?.address?.full_address || 'No address extracted'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Validation */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Validation Status
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(result.validation_results || {}).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                                                <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                                                {val.valid ? (
                                                    <span className="flex items-center text-green-400">
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Valid
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-400">
                                                        <X className="h-4 w-4 mr-1" /> Invalid
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
