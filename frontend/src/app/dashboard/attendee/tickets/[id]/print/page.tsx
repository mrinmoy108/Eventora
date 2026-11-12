"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCodeImage from "@/components/QRCodeImage";

export default function PrintTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchTicket = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/tickets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
        } else {
          setError("Ticket not found or unauthorized.");
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      // Small timeout to allow the QR code image to fully render before print dialog opens
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6C3FE8] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Preparing your printable pass...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Ticket</h1>
        <p className="text-gray-500 max-w-md mb-6">{error || "Could not retrieve ticket details."}</p>
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2.5 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { event, ticket_tier, attendee } = ticket;
  const eventDate = new Date(event?.start_datetime);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 font-sans print:bg-white print:py-0 print:min-h-0">
      
      {/* Control bar for screen view */}
      <div className="w-full max-w-3xl mb-6 flex justify-between items-center px-4 print:hidden">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()} 
            className="px-5 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-xl shadow-lg shadow-[#6C3FE8]/20 transition text-sm flex items-center gap-1.5"
          >
            🖨️ Print Ticket PDF
          </button>
        </div>
      </div>

      {/* Ticket Pass Layout Container */}
      <div className="w-full max-w-[800px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl print:shadow-none print:border-0 print:my-0 flex flex-col md:flex-row relative">
        
        {/* Left Decorative Header Accent (Cutout circle left) */}
        <div className="absolute top-[70%] md:top-1/2 -left-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200 z-10 print:hidden"></div>
        {/* Right Decorative Header Accent (Cutout circle right) */}
        <div className="absolute top-[70%] md:top-1/2 -right-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200 z-10 print:hidden"></div>

        {/* Main Section */}
        <div className="flex-[2] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-gray-300">
          <div>
            {/* Header branding */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-black text-[#1A1A2E] tracking-tight font-display">
                Eventora
              </span>
              <span className="inline-block px-3 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] rounded-full text-xs font-bold uppercase tracking-wider">
                {ticket_tier?.name || "Attendee Pass"}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A2E] tracking-tight leading-tight mb-4">
              {event?.title}
            </h1>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mt-6">
              <div>
                <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wider mb-1">DATE & TIME</span>
                <span className="text-gray-800 font-bold">
                  {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-gray-600 block text-xs mt-0.5">
                  {eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wider mb-1">VENUE</span>
                <span className="text-gray-800 font-bold block truncate">
                  {event?.venue_name || "Online Event"}
                </span>
                <span className="text-gray-500 block text-xs mt-0.5 truncate">
                  {event?.address ? `${event.address}, ${event.city}` : "Web Conference / Hybrid"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wider mb-1">ATTENDEE</span>
                <span className="text-gray-800 font-bold block">{attendee?.full_name || "Guest Ticket"}</span>
                <span className="text-gray-500 block text-xs">{attendee?.email}</span>
              </div>

              <div>
                <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-wider mb-1">PRICE / STATUS</span>
                <span className="text-gray-800 font-bold block">
                  ৳{parseFloat(ticket_tier?.price || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })} BDT
                </span>
                <span className="text-emerald-600 font-bold text-xs">✓ Validated Entry</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>Ticket ID: {ticket.id}</span>
            <span>Created: {new Date(ticket.created_at).toLocaleDateString("en-US", { dateStyle: "short" })}</span>
          </div>
        </div>

        {/* Tear-Off Stub (QR Code & Verification) */}
        <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center min-w-[200px] text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            SCAN TO VERIFY
          </span>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
            <QRCodeImage text={ticket.qr_code_token} size={130} />
          </div>

          <div className="mt-4">
            <span className="font-mono text-xs text-gray-500 tracking-wider font-bold block">
              {ticket.qr_code_token.substring(0, 16)}
            </span>
            <p className="text-[10px] text-gray-400 mt-2 leading-normal">
              Unique entry pass token. Do not share or duplicate.
            </p>
          </div>
        </div>

      </div>

      {/* Printing guidelines */}
      <div className="mt-8 max-w-3xl text-center px-4 print:hidden">
        <p className="text-xs text-gray-400">
          💡 <strong>Tip:</strong> If the layout cuts off, ensure your printer layout is set to <strong>Landscape</strong> or check margins in the print dialog.
        </p>
      </div>

    </div>
  );
}
