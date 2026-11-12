"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ticketSelections, setTicketSelections] = useState<{ [key: number]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${slug}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6FD]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C3FE8]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6FD]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A2E] mb-4">Event Not Found</h1>
          <Link href="/events" className="text-[#6C3FE8] hover:underline">Return to Events</Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (tierId: number, delta: number) => {
    setTicketSelections(prev => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[tierId];
        return copy;
      }
      return { ...prev, [tierId]: next };
    });
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(ticketSelections).forEach(tierIdStr => {
      const tierId = parseInt(tierIdStr);
      const tier = event.ticket_tiers?.find((t: any) => t.id === tierId);
      if (tier) {
        total += tier.price * ticketSelections[tierId];
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();
  const totalTickets = Object.values(ticketSelections).reduce((a, b) => a + b, 0);

  const handleProceedToPayment = async () => {
    if (totalTickets === 0) return;
    
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || token === "undefined" || token === "null" || !userStr || userStr === "undefined" || userStr === "null") {
      alert("Please sign in first to proceed with your booking.");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    
    let attendeeId;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      attendeeId = u.id;
    }

    const items = Object.keys(ticketSelections).map(tierIdStr => {
      const tierId = parseInt(tierIdStr);
      const tier = event.ticket_tiers.find((t: any) => t.id === tierId);
      return {
        ticketTierId: tierId,
        quantity: ticketSelections[tierId],
        price: tier.price
      };
    });

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: event.id,
          attendeeId: attendeeId,
          items: items
        })
      });

      const order = await res.json();
      
      if (res.ok) {
        // Redirect to our mock SSLCommerz payment page
        router.push(`/payment/${order.id}`);
      } else {
        alert(order.error || 'Failed to create order');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating order');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6FD] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href={`/events/${event.slug}`} className="text-[#6C3FE8] font-medium hover:underline mb-8 inline-block">
          &larr; Back to Event
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-2 font-display">Checkout</h1>
        <p className="text-gray-500 mb-8">{event.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="md:col-span-2 space-y-4">
            {event.ticket_tiers && event.ticket_tiers.length > 0 ? (
              event.ticket_tiers.map((tier: any) => (
                <div key={tier.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{tier.name}</h3>
                    <div className="text-[#6C3FE8] font-bold text-xl mt-1">
                      {tier.price === 0 ? 'Free' : `৳${tier.price}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleQuantityChange(tier.id, -1)}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl text-gray-500 hover:bg-gray-50"
                      disabled={!ticketSelections[tier.id]}
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-lg text-[#1A1A2E]">
                      {ticketSelections[tier.id] || 0}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(tier.id, 1)}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl text-gray-500 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
                No tickets available for this event yet.
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {Object.keys(ticketSelections).map(tierIdStr => {
                  const tierId = parseInt(tierIdStr);
                  const qty = ticketSelections[tierId];
                  const tier = event.ticket_tiers?.find((t: any) => t.id === tierId);
                  if (!qty || !tier) return null;
                  
                  return (
                    <div key={tierId} className="flex justify-between text-gray-600">
                      <span>{qty}x {tier.name}</span>
                      <span className="font-medium text-[#1A1A2E]">৳{tier.price * qty}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-[#1A1A2E]">Total</span>
                  <span className="font-bold text-[#6C3FE8] text-2xl">৳{totalAmount}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={totalTickets === 0 || submitting}
                className="w-full py-4 bg-[#6C3FE8] text-white rounded-xl font-bold text-lg hover:bg-[#5b32cc] transition shadow-lg shadow-[#6C3FE8]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
