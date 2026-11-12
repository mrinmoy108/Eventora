'use client';

import { useEffect, useState } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, event, professional
  const [filterFlagged, setFilterFlagged] = useState('all'); // all, flagged, safe
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setError('Failed to fetch reviews data.');
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('An error occurred while fetching reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerateReview = async (id: number, isFlagged: boolean, warnReviewer = false) => {
    try {
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_flagged: isFlagged, warn_reviewer: warnReviewer })
      });

      if (res.ok) {
        setSuccessMsg(warnReviewer ? 'Reviewer warned successfully.' : 'Review status updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchReviews();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to moderate review.');
      }
    } catch (err) {
      console.error('Error moderating review:', err);
      setError('An error occurred while moderating the review.');
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccessMsg('Review removed successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchReviews();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove review.');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('An error occurred while removing the review.');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      (review.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.reviewer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.reviewer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.event?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.professional?.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      filterType === 'all' || 
      review.reviewee_type === filterType;

    const matchesFlagged = 
      filterFlagged === 'all' || 
      (filterFlagged === 'flagged' && review.is_flagged) ||
      (filterFlagged === 'safe' && !review.is_flagged);

    return matchesSearch && matchesType && matchesFlagged;
  });

  const totalCount = reviews.length;
  const flaggedCount = reviews.filter((r) => r.is_flagged).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading reviews moderation...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reviews Moderation</h1>
        <p className="text-gray-500 text-sm mt-1">Moderate user reviews, resolve reported content, and send compliance warnings.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">500</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Flagged Reviews</p>
          <p className="text-3xl font-bold text-red-500 mt-2">{flaggedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Avg Rating</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">★ {averageRating}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by reviewer, event, professional, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-gray-50/50"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-white"
          >
            <option value="all">All Targets</option>
            <option value="event">Event Reviews</option>
            <option value="professional">Professional Reviews</option>
          </select>

          <select
            value={filterFlagged}
            onChange={(e) => setFilterFlagged(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="flagged">Flagged Only</option>
            <option value="safe">Safe Only</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.map((review) => {
          const stars = Array(5).fill(0).map((_, i) => i < review.rating);
          const reviewTarget = review.reviewee_type === 'event' 
            ? `Event: ${review.event?.title || 'Unknown Event'}`
            : `Professional: ${review.professional?.user?.full_name || 'Unknown Professional'}`;

          return (
            <div 
              key={review.id} 
              className={`bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between md:flex-row gap-6 items-start transition-all ${
                review.is_flagged ? 'border-red-200 bg-red-50/10' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="font-bold text-gray-800 text-sm">{review.reviewer?.full_name}</div>
                  <div className="text-xs text-gray-400 font-mono">{review.reviewer?.email}</div>
                  {review.is_flagged && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded uppercase tracking-wider">
                      Flagged
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {stars.map((filled, idx) => (
                    <span key={idx} className={`text-lg ${filled ? 'text-yellow-400' : 'text-gray-200'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 font-semibold ml-2">{reviewTarget}</span>
                </div>

                <p className="text-gray-700 text-sm italic font-medium">
                  "{review.comment || 'No comment provided.'}"
                </p>

                <div className="text-xs text-gray-400">
                  Reviewed on {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 w-full md:w-auto items-stretch justify-end">
                {review.is_flagged ? (
                  <button
                    onClick={() => handleModerateReview(review.id, false)}
                    className="flex-1 px-4 py-2 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-bold transition text-center cursor-pointer"
                  >
                    Approve (Unflag)
                  </button>
                ) : (
                  <button
                    onClick={() => handleModerateReview(review.id, true)}
                    className="flex-1 px-4 py-2 border border-orange-500 text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-bold transition text-center cursor-pointer"
                  >
                    Flag Review
                  </button>
                )}

                <button
                  onClick={() => handleModerateReview(review.id, review.is_flagged, true)}
                  className="flex-1 px-4 py-2 border border-[#6C3FE8] text-[#6C3FE8] hover:bg-[#6C3FE8]/5 rounded-lg text-xs font-bold transition text-center cursor-pointer"
                >
                  Warn Reviewer
                </button>

                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="flex-1 px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition text-center cursor-pointer"
                >
                  Remove (Delete)
                </button>
              </div>
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="bg-white py-16 text-center text-gray-450 border rounded-xl border-dashed border-gray-200">
            <span className="text-4xl block mb-2">💬</span>
            <p className="font-medium text-sm">No reviews found matching the filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
