"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrganizerTeamPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/bookings?organizerId=${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const submitReview = async () => {
    if (!selectedBooking) return;
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewee_type: "professional",
          professional_id: selectedBooking.professional_id,
          booking_id: selectedBooking.id,
          event_id: selectedBooking.event_id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setReviewModalOpen(false);
        alert("Review submitted successfully!");
        // Refresh bookings or simply mark this booking as reviewed in state if we had a has_review flag
        // For simplicity, we just close the modal.
      } else {
        alert("Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-50 text-orange-600 border border-orange-200";
      case "accepted":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "declined":
        return "bg-red-50 text-red-600 border border-red-200";
      case "completed":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const getSpecialtyLabel = (type: string) => {
    return type ? type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Professional";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Loading Team Bookings...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
            Event Team Bookings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage service professionals hired for your events.
          </p>
        </div>
        <Link 
          href="/professionals" 
          className="px-5 py-2.5 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition flex items-center gap-2 cursor-pointer"
        >
          🔍 Find Professionals
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-[#1A1A2E]">No team members hired yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto mb-8">
            Browse our directory to find elite event managers, photographers, and videographers to make your event perfect!
          </p>
          <Link 
            href="/professionals" 
            className="px-6 py-3 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition inline-block cursor-pointer"
          >
            Explore Service Professionals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const profUser = booking.professional?.user;
            const eventDate = new Date(booking.event_date);
            return (
              <div 
                key={booking.id} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                {/* Header Information */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#6C3FE8]/10 text-[#6C3FE8] flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {profUser?.full_name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">
                          {profUser?.full_name || "Professional"}
                        </h3>
                        <span className="text-xs text-[#6C3FE8] font-bold mt-0.5 block">
                          {getSpecialtyLabel(booking.professional?.pro_type)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.status === 'accepted' && (
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${booking.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                          {booking.payment_status || 'unpaid'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Specifics */}
                  <div className="mt-6 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Event</span>
                      <span className="font-bold text-gray-800 text-right truncate max-w-[200px]" title={booking.event?.title}>
                        {booking.event?.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event Date</span>
                      <span className="font-bold text-gray-800">
                        {eventDate.toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Package Details</span>
                      <span className="font-bold text-gray-800">
                        {booking.package?.name || "Custom Hire"}
                      </span>
                    </div>
                    {booking.agreed_price && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Agreed Price</span>
                        <span className="font-bold text-emerald-600">
                          ৳{parseFloat(booking.agreed_price).toLocaleString("en-US")} BDT
                        </span>
                      </div>
                    )}
                  </div>

                  {booking.message && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-500 italic leading-relaxed">
                      "{booking.message}"
                    </div>
                  )}
                </div>

                {/* Footer action bar */}
                <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span>Booking ID: #{booking.id}</span>
                    <span>Contact: {profUser?.email || "N/A"}</span>
                  </div>
                  {booking.status === 'accepted' && booking.payment_status !== 'paid' && (
                    <Link href={`/booking-payment/${booking.id}`} className="px-4 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-lg transition shadow-sm text-center">
                      Pay Now
                    </Link>
                  )}
                  {(booking.payment_status === 'paid' || booking.status === 'completed') && (
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setRating(5);
                        setComment("");
                        setReviewModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition shadow-sm text-center"
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leave Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Leave a Review</h3>
              <p className="text-sm text-gray-500 mt-1">
                For {selectedBooking.professional?.user?.full_name}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#6C3FE8] focus:border-transparent"
                  rows={4}
                  placeholder="Share your experience working with this professional..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
                disabled={reviewSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="px-6 py-2 bg-[#6C3FE8] text-white rounded-lg font-medium hover:bg-[#5532b8] transition shadow-md disabled:opacity-70"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
