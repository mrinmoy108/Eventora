'use client';

import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users.');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setRole(user.role || 'attendee');
    setPhone(user.phone || '');
    setIsActive(user.is_active ?? true);
    setIsVerified(user.is_verified ?? false);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          role,
          phone,
          is_active: isActive,
          is_verified: isVerified
        })
      });

      if (res.ok) {
        setSuccessMsg(`User ${fullName} updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        closeEditModal();
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update user.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating the user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) {
    return <div className="p-10 text-center text-gray-500 font-medium">Loading user management...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and edit user accounts, roles, phone details, and access states.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold px-2">×</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-green-800">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700 font-bold px-2">×</button>
        </div>
      )}

      {/* Users list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/55 text-sm text-gray-500">
                <th className="p-4 font-semibold">Name & Phone</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-800 text-sm">{u.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{u.phone || 'No phone'}</p>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold uppercase tracking-wider">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.is_verified ? (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">✓ Verified</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">Unverified</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  <td className="p-4">
                    {u.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">Banned</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditModal(u)}
                      className="px-3 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] hover:bg-[#6C3FE8] hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-medium">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit User Details</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="No phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium bg-white"
                >
                  <option value="attendee">Attendee</option>
                  <option value="organizer">Organizer</option>
                  <option value="event_manager">Event Manager</option>
                  <option value="photographer">Photographer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#6C3FE8] rounded focus:ring-[#6C3FE8]"
                  />
                  <span>Active Status</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#6C3FE8] rounded focus:ring-[#6C3FE8]"
                  />
                  <span>Verified User</span>
                </label>
              </div>

              <div className="pt-6 border-t flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2 border rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-lg text-sm font-bold shadow-md transition cursor-pointer text-center"
                >
                  {submitting ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
