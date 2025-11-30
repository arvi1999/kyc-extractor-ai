import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSubmit, user = null, mode = 'create' }) {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        is_active: true
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                email: user.email || '',
                full_name: user.full_name || '',
                password: '',
                role: user.role || 'user',
                is_active: user.is_active !== false
            });
        } else {
            setFormData({
                email: '',
                full_name: '',
                password: '',
                role: 'user',
                is_active: true
            });
        }
        setErrors({});
    }, [user, mode, isOpen]);

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required';
        }

        if (mode === 'create' && !formData.password) {
            newErrors.password = 'Password is required';
        }

        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white">
                            {mode === 'create' ? 'Create New User' : 'Edit User'}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {mode === 'create' ? 'Add a new user to the system' : 'Update user details'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="block w-full px-4 py-2.5 glass rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                            placeholder="John Doe"
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full px-4 py-2.5 glass rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                            placeholder="john@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                        )}
                    </div>

                    {/* Password (only for create or if changing) */}
                    {(mode === 'create' || formData.password) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password {mode === 'edit' && '(leave blank to keep unchanged)'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="block w-full px-4 py-2.5 glass rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="block w-full px-4 py-2.5 glass rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Active Status (edit mode only) */}
                    {mode === 'edit' && (
                        <div className="flex items-center justify-between glass rounded-xl p-4">
                            <div>
                                <p className="text-sm font-medium text-white">Active Status</p>
                                <p className="text-xs text-slate-400">Enable or disable user access</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                            </label>
                        </div>
                    )}

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-3 glass border border-red-500/50 rounded-xl bg-red-500/5">
                            <p className="text-sm text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 glass rounded-xl text-white hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
