import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Users as UsersIcon, Plus, Edit2, Trash2, Search, Shield, ShieldCheck, XCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Users() {
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null, userName: '' });

    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await api.post('/users', userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/users/${id}`, null, { params: data });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            await api.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        }
    });

    const handleCreateUser = async (formData) => {
        await createUserMutation.mutateAsync(formData);
    };

    const handleEditUser = async (formData) => {
        const updateData = {
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            is_active: formData.is_active
        };

        await updateUserMutation.mutateAsync({ id: selectedUser.id, data: updateData });
    };

    const handleDeleteUser = async () => {
        await deleteUserMutation.mutateAsync(confirmDialog.userId);
        setConfirmDialog({ isOpen: false, userId: null, userName: '' });
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setModalOpen(true);
    };

    const openDeleteDialog = (user) => {
        setConfirmDialog({
            isOpen: true,
            userId: user.id,
            userName: user.full_name || user.email
        });
    };

    const filteredUsers = users?.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <UsersIcon className="w-6 h-6 text-purple-400" />
                        <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                    </div>
                    <p className="text-slate-400">Manage system users and permissions</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="glass rounded-2xl p-16 text-center">
                    <div className="inline-block">
                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading users...</p>
                    </div>
                </div>
            ) : isError ? (
                <div className="glass border border-red-500/50 rounded-2xl p-6 flex items-center gap-3 bg-red-500/5">
                    <XCircle className="h-6 w-6 text-red-400" />
                    <p className="text-red-400 font-medium">Failed to load users. Please try again later.</p>
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {user.full_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full",
                                                user.role === 'admin'
                                                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                                                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30"
                                            )}>
                                                {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full",
                                                user.is_active
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                            )}>
                                                {user.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-300">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-400">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all"
                                                    title="Edit user"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(user)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 transition-all"
                                                    title="Deactivate user"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="glass rounded-2xl p-16 text-center">
                    <div className="inline-block p-4 rounded-2xl bg-purple-500/10 mb-4">
                        <UsersIcon className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                    <p className="text-slate-400 mb-6">
                        {searchQuery ? 'Try a different search query' : 'Create your first user to get started'}
                    </p>
                </div>
            )}

            {/* Modals */}
            <UserModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={modalMode === 'create' ? handleCreateUser : handleEditUser}
                user={selectedUser}
                mode={modalMode}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Deactivate User"
                message={`Are you sure you want to deactivate ${confirmDialog.userName}? They will no longer be able to access the system.`}
                confirmText="Deactivate"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDeleteUser}
                onCancel={() => setConfirmDialog({ isOpen: false, userId: null, userName: '' })}
            />
        </div>
    );
}
