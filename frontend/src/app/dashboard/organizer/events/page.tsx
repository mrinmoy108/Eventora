"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function OrganizerEventsPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events?organizerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Error fetching organizer events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleDeleteEvent = async (eventId: number) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}?organizerId=${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting event. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Loading Events...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
            My Events
          </h1>
          <p className="mt-2 text-gray-600">
            View, monitor, and manage all your hosted events.
          </p>
        </div>
        <Link 
          href="/dashboard/organizer/events/create" 
          className="px-5 py-2.5 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-bold text-[#1A1A2E]">No events hosted yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto mb-8">
            Create your first event to set up ticket tiers and start inviting attendees!
          </p>
          <Link 
            href="/dashboard/organizer/events/create" 
            className="px-6 py-3 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition inline-block cursor-pointer"
          >
            Host Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => {
            const startDate = new Date(event.start_datetime);
            return (
              <div 
                key={event.id} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition-all duration-300"
              >
                {/* Event Image */}
                <div className="relative w-full md:w-48 h-40 md:h-auto bg-gray-100 flex-shrink-0">
                  <Image 
                    src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className="inline-block px-2.5 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] rounded-lg text-xs font-bold uppercase tracking-wider">
                        {event.category?.name || "Event"}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[10px] font-bold uppercase">
                        {event.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1A2E] hover:text-[#6C3FE8] transition-colors leading-tight">
                      {event.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {event.short_desc || event.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400 font-medium block">Date & Time</span>
                        <span className="font-bold text-gray-800">
                          {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium block">Venue</span>
                        <span className="font-bold text-gray-800 truncate block max-w-[150px]">
                          {event.venue_name || "Online / Hybrid"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium block">City / Country</span>
                        <span className="font-bold text-gray-800">
                          {event.city ? `${event.city}, ${event.country}` : "Global"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">ID: #{event.id}</span>
                    <div className="flex gap-3">
                      <Link 
                        href={`/events/${event.slug}`} 
                        target="_blank"
                        className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        👁️ Preview
                      </Link>
                      <Link 
                        href={`/dashboard/organizer/events/edit/${event.id}`} 
                        className="px-4 py-1.5 border border-[#6C3FE8]/30 hover:bg-[#6C3FE8]/5 text-[#6C3FE8] font-medium rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        ✏️ Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="px-4 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 font-medium rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
