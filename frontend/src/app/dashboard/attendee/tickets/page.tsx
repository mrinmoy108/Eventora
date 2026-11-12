"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCodeImage from "@/components/QRCodeImage";


export default function MyTicketsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/user/tickets?attendeeId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Loading Tickets...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
        My Tickets
      </h1>
      <p className="mt-2 text-gray-600">
        View and manage all your purchased event tickets.
      </p>

      {tickets.length === 0 ? (
        <div className="mt-12 text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-xl font-bold text-[#1A1A2E]">No tickets purchased yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            When you buy a ticket for an event, it will show up here along with its QR code for check-in.
          </p>
          <Link href="/events" className="mt-6 inline-block px-6 py-3 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition">
            Browse Bangladeshi Events
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 flex items-start gap-4">
                
                {/* Left: real QR Code */}
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 select-none">
                  <div className="bg-white p-1 border border-gray-100 rounded">
                    <QRCodeImage text={t.qr_code_token} size={64} />
                  </div>
                  <span className="text-[7.5px] font-mono text-gray-400 mt-1 truncate max-w-[80px]">
                    {t.qr_code_token.split('-')[1] || t.id}
                  </span>
                </div>

                {/* Right: details */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-[#6C3FE8]/10 text-[#6C3FE8] rounded text-[9.5px] font-bold uppercase mb-1.5">
                    {t.ticket_tier?.name || 'Ticket'}
                  </span>
                  <h3 className="font-bold text-gray-800 text-base leading-tight truncate">
                    {t.event?.title || 'Event ticket'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                    📅 {new Date(t.event?.start_datetime).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    📍 {t.event?.venue_name || 'Online'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Ticket ID: {t.id}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => window.open(`/dashboard/attendee/tickets/${t.id}/print`, '_blank')}
                    className="px-3 py-1 bg-[#6C3FE8] text-white rounded-lg font-semibold hover:bg-[#5532b8] transition text-xs flex items-center gap-1 cursor-pointer"
                  >
                    🖨️ Print Pass
                  </button>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active / Valid</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
