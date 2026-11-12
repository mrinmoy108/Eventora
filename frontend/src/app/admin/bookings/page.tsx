'use client';

import { useEffect, useState } from 'react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dispute resolution states
  const [selectedDisputeBooking, setSelectedDisputeBooking] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [disputePrice, setDisputePrice] = useState('');
  const [disputeStatus, setDisputeStatus] = useState('');
  const [disputePaymentStatus, setDisputePaymentStatus] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        setError('Failed to fetch bookings data.');
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('An error occurred while fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenDispute = async (booking: any) => {
    setSelectedDisputeBooking(booking);
    setDisputePrice(booking.agreed_price?.toString() || '0');
    setDisputeStatus(booking.status);
    setDisputePaymentStatus(booking.payment_status);
    setLoadingChat(true);
    setChatMessages([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${booking.id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeBooking) return;
    setResolvingDispute(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${selectedDisputeBooking.id}/resolve-dispute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: disputeStatus,
          payment_status: disputePaymentStatus,
          agreed_price: Number(disputePrice)
        })
      });

      if (res.ok) {
        setSuccessMsg('Dispute resolved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setSelectedDisputeBooking(null);
        fetchBookings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resolve dispute.');
      }
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setError('An error occurred while resolving dispute.');
    } finally {
      setResolvingDispute(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!confirm('Are you sure you want to mark this booking as paid?')) return;

    try {
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccessMsg('Booking marked as paid successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchBookings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update payment status.');
      }
    } catch (err) {
      console.error('Failed to pay booking:', err);
      setError('An error occurred while updating the booking payment.');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSuccessMsg(`Booking status updated to ${newStatus}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchBookings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError('An error occurred while updating booking status.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      String(booking.id).includes(searchQuery) ||
      (booking.event?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.organizer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.professional?.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      booking.status === filterStatus;

    const matchesPayment = 
      filterPayment === 'all' || 
      booking.payment_status === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.agreed_price || 0), 0);
  const pendingPaymentCount = bookings.filter(b => b.payment_status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading bookings management...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track service contracts between organizers and professionals.</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Agreed Revenue (Paid)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">BDT {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Completed Jobs</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{completedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Unpaid Bookings</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{pendingPaymentCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by ID, event, organizer, or pro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-gray-50/50"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-white"
          >
            <option value="all">All Job Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-white"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/55 text-sm text-gray-500">
                <th className="p-4 font-semibold">Booking ID</th>
                <th className="p-4 font-semibold">Event & Organizer</th>
                <th className="p-4 font-semibold">Professional</th>
                <th className="p-4 font-semibold">Agreed Price</th>
                <th className="p-4 font-semibold">Job Status</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const createdDate = new Date(booking.created_at);

                return (
                  <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    {/* Booking ID & Date */}
                    <td className="p-4 text-xs font-mono text-gray-600">
                      <p className="font-bold text-gray-800">#{booking.id}</p>
                      <p className="text-gray-400 mt-1">
                        {createdDate.toLocaleDateString(undefined, { dateStyle: 'short' })}
                      </p>
                    </td>

                    {/* Event & Organizer */}
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]" title={booking.event?.title}>
                        {booking.event?.title || 'Unknown Event'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{booking.organizer?.full_name}</p>
                    </td>

                    {/* Professional */}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {booking.professional?.user?.full_name || 'Service Professional'}
                      </p>
                    </td>

                    {/* Agreed Price */}
                    <td className="p-4 text-sm font-bold text-gray-800">
                      ৳{Number(booking.agreed_price).toLocaleString()}
                    </td>

                    {/* Job Status Badges */}
                    <td className="p-4">
                      {booking.status === 'pending' && (
                        <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                          Pending
                        </span>
                      )}
                      {booking.status === 'accepted' && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                          Accepted
                        </span>
                      )}
                      {booking.status === 'declined' && (
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                          Declined
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                          Completed
                        </span>
                      )}
                    </td>

                    {/* Payment status badge */}
                    <td className="p-4">
                      {booking.payment_status === 'paid' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[11px] font-bold rounded">
                          Unpaid
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1.5 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDispute(booking)}
                        className="px-2 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-350 rounded text-xs font-bold transition-all cursor-pointer"
                      >
                        View Dispute
                      </button>
                      {booking.payment_status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(booking.id)}
                          className="px-2 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] hover:bg-[#6C3FE8] hover:text-white rounded text-xs font-bold transition-all cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                      {booking.status !== 'completed' && booking.status !== 'declined' && (
                        <select
                          onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                          defaultValue={booking.status}
                          className="px-2 py-1 border rounded text-xs text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#6C3FE8]"
                        >
                          <option value="pending" disabled>Set Status</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="declined">Declined</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-medium">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dispute & Chat history Modal */}
      {selectedDisputeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
            
            {/* Conversation Log (Left pane) */}
            <div className="flex-1 flex flex-col border-r h-full bg-gray-50/50">
              <div className="p-5 border-b bg-white">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>💬 Client-Professional Chat History</span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded uppercase">
                    Dispute Log
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">Review communication records between organizer and professional.</p>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {loadingChat ? (
                  <div className="text-center py-10 text-gray-400 font-medium">Loading conversation history...</div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 italic">
                    No messaging records found for this booking.
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isOrganizer = msg.sender?.role === 'organizer';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isOrganizer ? 'items-start' : 'items-end'}`}
                      >
                        <div className="text-[10px] font-semibold text-gray-400 mb-1">
                          {msg.sender?.full_name} ({msg.sender?.role})
                        </div>
                        <div className={`p-3 rounded-xl max-w-[80%] text-sm font-medium ${
                          isOrganizer 
                            ? 'bg-white border text-gray-800 rounded-tl-none' 
                            : 'bg-[#6C3FE8] text-white rounded-tr-none'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="text-[9px] text-gray-400 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Resolve Dispute Form (Right pane) */}
            <form onSubmit={handleResolveDispute} className="w-full md:w-96 flex flex-col h-full bg-white">
              <div className="p-5 border-b">
                <h3 className="text-lg font-bold text-gray-800">Resolve Booking Dispute</h3>
                <p className="text-xs text-gray-400 mt-1">Update booking contract details, status, and payouts.</p>
              </div>

              <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                <div className="bg-gray-50/70 p-4 rounded-xl space-y-2 border text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Organizer</span>
                    <span className="font-bold text-gray-800">{selectedDisputeBooking.organizer?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional</span>
                    <span className="font-bold text-gray-800">{selectedDisputeBooking.professional?.user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event</span>
                    <span className="font-bold text-gray-800 truncate max-w-[150px]">{selectedDisputeBooking.event?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Date</span>
                    <span className="font-bold text-gray-800">{new Date(selectedDisputeBooking.event_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Agreed Price (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    value={disputePrice}
                    onChange={(e) => setDisputePrice(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-700"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Adjust this to issue partial payout / refund.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Job Status
                  </label>
                  <select
                    value={disputeStatus}
                    onChange={(e) => setDisputeStatus(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-700 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Payment Status
                  </label>
                  <select
                    value={disputePaymentStatus}
                    onChange={(e) => setDisputePaymentStatus(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-700 bg-white"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="payout_pending">Payout Pending</option>
                    <option value="payout_done">Payout Done</option>
                  </select>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeBooking(null)}
                  className="flex-1 py-2.5 border hover:bg-gray-150 rounded-lg text-xs font-bold text-gray-600 transition"
                  disabled={resolvingDispute}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingDispute}
                  className="flex-1 py-2.5 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-lg text-xs font-bold transition shadow-md"
                >
                  {resolvingDispute ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
