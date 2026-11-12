'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [selectedPro, setSelectedPro] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [proType, setProType] = useState('event_manager');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [basePrice, setBasePrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per_event');
  const [yearsExp, setYearsExp] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openEditModal = (pro: any) => {
    setSelectedPro(pro);
    setProType(pro.pro_type || 'event_manager');
    setBio(pro.bio || '');
    setCity(pro.city || '');
    setCountry(pro.country || 'Bangladesh');
    setBasePrice(pro.base_price?.toString() || '0');
    setPriceUnit(pro.price_unit || 'per_event');
    setYearsExp(pro.years_exp?.toString() || '0');
    setIsApproved(pro.is_approved ?? false);
    setIsAvailable(pro.is_available ?? true);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedPro(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPro) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/professionals/${selectedPro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pro_type: proType,
          bio,
          city,
          country,
          base_price: Number(basePrice),
          price_unit: priceUnit,
          years_exp: Number(yearsExp),
          is_approved: isApproved,
          is_available: isAvailable
        })
      });

      if (res.ok) {
        setSuccessMsg(`Professional profile for ${selectedPro.user?.full_name} updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        closeEditModal();
        fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update professional.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating the professional profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!stats) return <div className="p-10 text-center text-gray-500 font-medium">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview metrics and recently registered professional applications.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-[#22C55E] mt-2">BDT {stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Recently Added Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Added Professionals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500 bg-gray-50/50">
                <th className="p-4 font-medium">Name & Email</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProfessionals.map((pro: any) => (
                <tr key={pro.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-850 text-sm">{pro.user.full_name}</p>
                    <p className="text-xs text-gray-450 mt-0.5">{pro.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-600 text-sm capitalize">
                    {pro.pro_type.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4">
                    {pro.is_approved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Approved</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditModal(pro)}
                      className="px-3 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] hover:bg-[#6C3FE8] hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {stats.recentProfessionals.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400 text-sm font-medium">
                    No professionals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Professional Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Professional Profile</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Professional Type</label>
                  <select
                    value={proType}
                    onChange={(e) => setProType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium bg-white"
                  >
                    <option value="event_manager">Event Manager</option>
                    <option value="photographer">Photographer</option>
                    <option value="videographer">Videographer</option>
                    <option value="photographer_videographer">Photographer & Videographer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Base Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price Unit</label>
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium bg-white"
                  >
                    <option value="per_hour">Per Hour</option>
                    <option value="per_day">Per Day</option>
                    <option value="per_event">Per Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] text-gray-700 font-medium"
                />
              </div>

              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="w-4 h-4 text-[#6C3FE8] rounded focus:ring-[#6C3FE8]"
                  />
                  <span>Approved Profile</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-[#6C3FE8] rounded focus:ring-[#6C3FE8]"
                  />
                  <span>Available for Bookings</span>
                </label>
              </div>

              <div className="pt-6 border-t flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2 border rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-55 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-lg text-sm font-bold shadow-md transition cursor-pointer text-center"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
