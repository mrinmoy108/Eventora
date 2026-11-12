'use client';

import { useEffect, useState } from 'react';

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('settings'); // settings, transactions, payouts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Settings state
  const [settings, setSettings] = useState<any[]>([]);
  const [commissionPercent, setCommissionPercent] = useState('5.00');
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [savingSettings, setSavingSettings] = useState(false);

  // Transactions state
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [refundOrderId, setRefundOrderId] = useState<number | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Payouts state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [editingPayoutId, setEditingPayoutId] = useState<number | null>(null);
  const [payoutStatus, setPayoutStatus] = useState('completed');
  const [transactionRef, setTransactionRef] = useState('');
  const [updatingPayout, setUpdatingPayout] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Settings
      const settingsRes = await fetch('http://localhost:5000/api/admin/settings', { headers });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        const comm = settingsData.find((s: any) => s.setting_key === 'platform_commission_percent');
        if (comm) setCommissionPercent(comm.setting_value);
        const sched = settingsData.find((s: any) => s.setting_key === 'payout_schedule');
        if (sched) setPayoutSchedule(sched.setting_value);
      }

      // Fetch Transactions
      const transRes = await fetch('http://localhost:5000/api/admin/payments/transactions', { headers });
      if (transRes.ok) {
        const transData = await transRes.json();
        setOrders(transData.orders || []);
        setBookings(transData.bookings || []);
      }

      // Fetch Payouts
      const payoutsRes = await fetch('http://localhost:5000/api/admin/payouts', { headers });
      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData || []);
      }
    } catch (err) {
      console.error('Error fetching payments data:', err);
      setError('An error occurred while loading payment information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: [
            { setting_key: 'platform_commission_percent', setting_value: commissionPercent },
            { setting_key: 'payout_schedule', setting_value: payoutSchedule }
          ]
        })
      });

      if (res.ok) {
        setSuccessMsg('Platform settings saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchData();
      } else {
        setError('Failed to update platform settings.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRefundOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId) return;
    setRefunding(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/payments/orders/${refundOrderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: refundAmount ? Number(refundAmount) : undefined })
      });

      if (res.ok) {
        setSuccessMsg('Refund issued successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setRefundOrderId(null);
        setRefundAmount('');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to issue refund.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while issuing refund.');
    } finally {
      setRefunding(false);
    }
  };

  const handleUpdatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayoutId) return;
    setUpdatingPayout(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/payouts/${editingPayoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: payoutStatus, transaction_ref: transactionRef })
      });

      if (res.ok) {
        setSuccessMsg('Payout status updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setEditingPayoutId(null);
        setTransactionRef('');
        fetchData();
      } else {
        setError('Failed to update payout status.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating payout.');
    } finally {
      setUpdatingPayout(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading payments & payouts...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payments & Commissions</h1>
        <p className="text-gray-500 text-sm mt-1">Configure platform pricing, monitor transactions, and manage user payouts.</p>
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

      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`pb-3 px-2 font-bold text-sm transition ${activeTab === 'settings' ? 'text-[#6C3FE8] border-b-2 border-[#6C3FE8]' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('settings')}
        >
          Commission Settings
        </button>
        <button
          className={`pb-3 px-2 font-bold text-sm transition ${activeTab === 'transactions' ? 'text-[#6C3FE8] border-b-2 border-[#6C3FE8]' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
        <button
          className={`pb-3 px-2 font-bold text-sm transition ${activeTab === 'payouts' ? 'text-[#6C3FE8] border-b-2 border-[#6C3FE8]' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('payouts')}
        >
          Payouts Queue
        </button>
      </div>

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-850 mb-6">Commission & Finance Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] font-medium text-gray-700"
              />
              <p className="text-gray-400 text-xs mt-1">Percentage fee cut taken from ticket sales and service gigs.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Automatic Payout Schedule
              </label>
              <select
                value={payoutSchedule}
                onChange={(e) => setPayoutSchedule(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] bg-white font-medium text-gray-700 cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Releases Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              {savingSettings ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="space-y-10">
          {/* Ticket Sales Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-800 text-lg">Ticket Sales Transactions (Orders)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50/55 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Attendee</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">Platform Fee</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Refunded</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const priceSub = Number(order.subtotal);
                    const platformFee = (priceSub * Number(commissionPercent)) / 100;
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                        <td className="p-4 text-xs font-mono font-bold text-gray-850">#{order.id}</td>
                        <td className="p-4 text-sm font-semibold text-gray-700">
                          <p>{order.attendee?.full_name}</p>
                          <p className="text-xs text-gray-400 font-normal mt-0.5">{order.attendee?.email}</p>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-700 truncate max-w-[200px]" title={order.event?.title}>
                          {order.event?.title}
                        </td>
                        <td className="p-4 text-sm text-gray-700 font-bold">৳{priceSub.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-500 font-medium">৳{platformFee.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-800 font-bold">৳{Number(order.total_amount).toLocaleString()}</td>
                        <td className="p-4 text-sm text-red-500 font-bold">৳{Number(order.refunded_amount).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.payment_status === 'refunded' ? 'bg-gray-150 text-gray-700 border border-gray-250' :
                            order.payment_status === 'partial_refund' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-yellow-50 text-yellow-750 border border-yellow-200'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {order.payment_status === 'paid' && (
                            <button
                              onClick={() => {
                                setRefundOrderId(order.id);
                                setRefundAmount(order.total_amount);
                              }}
                              className="px-2.5 py-1 border border-red-500 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400 text-sm font-medium">No order transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Hires Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-800 text-lg">Service Gigs Transactions (Bookings)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50/55 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Organizer</th>
                    <th className="p-4">Professional</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Agreed Price</th>
                    <th className="p-4">Platform Fee</th>
                    <th className="p-4">Net Payout</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Job Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                      <td className="p-4 text-xs font-mono font-bold text-gray-850">#{booking.id}</td>
                      <td className="p-4 text-sm font-semibold text-gray-700">
                        <p>{booking.organizer?.full_name}</p>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">{booking.organizer?.email}</p>
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-700">
                        {booking.professional?.user?.full_name}
                      </td>
                      <td className="p-4 text-sm text-gray-600 truncate max-w-[150px]" title={booking.event?.title}>
                        {booking.event?.title}
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-bold">৳{Number(booking.agreed_price || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-gray-500">৳{Number(booking.platform_fee || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-emerald-600 font-bold">৳{Number(booking.net_payout || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          booking.payment_status === 'payout_done' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          booking.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          booking.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400 text-sm font-medium">No booking transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUTS QUEUE */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-800 text-lg">Platform Payout Releases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50/55 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="p-4">Payout ID</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference Log</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-xs font-mono font-bold text-gray-800">#{payout.id}</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">
                      <p>{payout.recipient?.full_name}</p>
                      <p className="text-xs text-gray-400 font-normal uppercase mt-0.5">{payout.recipient?.role}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-500 uppercase">
                      {payout.reference_type} #{payout.reference_id}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-bold">৳{Number(payout.amount).toLocaleString()}</td>
                    <td className="p-4 text-xs font-semibold text-gray-600 uppercase">{payout.method}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        payout.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        payout.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-500">
                      {payout.transaction_ref || <span className="italic text-gray-400">None</span>}
                    </td>
                    <td className="p-4 text-right">
                      {payout.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setEditingPayoutId(payout.id);
                            setPayoutStatus(payout.status);
                            setTransactionRef(payout.transaction_ref || '');
                          }}
                          className="px-2 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] hover:bg-[#6C3FE8] hover:text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 &&
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400 text-sm font-medium">No payouts found.</td>
                  </tr>
                }
              </tbody>
              </table>
            </div>
          </div>
        )}

      {/* REFUND MODAL */}
      {refundOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Issue Ticket Order Refund</h3>
              <p className="text-sm text-gray-500 mt-1">Refund amount for Order #{refundOrderId}</p>
            </div>
            <form onSubmit={handleRefundOrder}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Refund Amount (BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Defaults to full order amount.</p>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRefundOrderId(null)}
                  className="px-4 py-2 text-gray-650 hover:bg-gray-250 rounded-lg font-medium transition"
                  disabled={refunding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="px-6 py-2 bg-red-600 hover:bg-red-750 text-white rounded-lg font-medium transition shadow-md"
                >
                  {refunding ? 'Refunding...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PAYOUT MODAL */}
      {editingPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Process Payout Release</h3>
              <p className="text-sm text-gray-500 mt-1">Update payout state for Payout #{editingPayoutId}</p>
            </div>
            <form onSubmit={handleUpdatePayout}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Payout Status</label>
                  <select
                    value={payoutStatus}
                    onChange={(e) => setPayoutStatus(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-700 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Transaction Reference (Bank Ref, TxHash, etc.)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-92083120"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent font-medium text-gray-750"
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPayoutId(null)}
                  className="px-4 py-2 text-gray-650 hover:bg-gray-250 rounded-lg font-medium transition"
                  disabled={updatingPayout}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPayout}
                  className="px-6 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-lg font-medium transition shadow-md"
                >
                  {updatingPayout ? 'Updating...' : 'Update Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
