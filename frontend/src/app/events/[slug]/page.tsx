"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard/attendee");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);
      if (userStr && userStr !== "undefined" && userStr !== "null") {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "organizer") setDashboardUrl("/dashboard/organizer");
          else if (["photographer", "videographer", "event_manager"].includes(user.role)) setDashboardUrl("/dashboard/professional");
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`http://localhost:5000/api/events/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setEvent(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6FD] flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading amazing experience...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F7F6FD] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🥲</div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Event Not Found</h1>
        <p className="text-gray-500 mb-8">This event might have been cancelled or removed.</p>
        <Link href="/events" className="px-6 py-3 bg-[#6C3FE8] text-white rounded-xl font-bold hover:bg-[#5b32cc] transition">
          Browse Other Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6FD] font-sans">
      {/* Navbar (Dark) */}
      <nav className="bg-[#0F0C29] w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white font-display tracking-tight">Eventora</Link>
          <div className="flex gap-4">
            {isClient && isLoggedIn ? (
              <Link href={dashboardUrl} className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-medium transition shadow-lg shadow-black/10 border border-white/20">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-5 py-2 text-white/90 hover:text-white font-medium transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full bg-[#1A1A2E]">
        <Image 
          src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
          alt={event.title}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F6FD] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-6 translate-y-1/2">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center border border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#6C3FE8]/10 text-[#6C3FE8] px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    {event.category?.name || 'Event'}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    {event.event_type.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A2E] font-display mb-4 leading-tight">
                  {event.title}
                </h1>
                <p className="text-gray-500 text-lg line-clamp-2">{event.description}</p>
              </div>
              
              <div className="w-full md:w-auto bg-[#F7F6FD] p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-w-[250px]">
                <div className="text-gray-500 uppercase tracking-wider text-sm font-bold mb-1">Starts At</div>
                <div className="text-2xl font-bold text-[#1A1A2E] mb-4 text-center">
                  {new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
                  <span className="text-[#6C3FE8]">{new Date(event.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <Link href={`/events/${event.slug}/checkout`} className="block w-full py-4 bg-[#6C3FE8] text-white rounded-xl font-bold text-lg hover:bg-[#5b32cc] transition shadow-lg shadow-[#6C3FE8]/30 text-center">
                  Get Tickets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">About this event</h2>
            <div className="prose prose-lg text-gray-600">
              {event.description}
            </div>
          </section>

          {/* Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">Event Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.gallery.map((item: any) => (
                  <div key={item.id} className="relative aspect-video rounded-2xl overflow-hidden border border-gray-250 shadow-sm hover:shadow-md transition duration-300 group">
                    <img 
                      src={item.image_url} 
                      alt={item.caption || "Event gallery image"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">Location</h2>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">📍</div>
              <div>
                <h3 className="font-bold text-lg text-[#1A1A2E]">{event.venue_name || event.address}</h3>
                <p className="text-gray-500">{event.address}</p>
                <p className="text-gray-500">{event.city}, {event.country}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Organizer */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Organized by</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {event.organizer?.avatar_url ? (
                   <img src={event.organizer.avatar_url} alt="Organizer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold">
                    {event.organizer?.full_name?.charAt(0) || 'O'}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-lg text-[#1A1A2E]">{event.organizer?.full_name || 'Organizer Name'}</div>
                <div className="text-sm text-gray-500">Event Organizer</div>
              </div>
            </div>
            <button className="w-full py-2 border-2 border-gray-200 text-[#1A1A2E] font-bold rounded-xl hover:bg-gray-50 transition">
              Contact Organizer
            </button>
          </div>

          {/* Share */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Share this event</h3>
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex justify-center items-center text-xl">🔗</button>
              <button className="flex-1 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition flex justify-center items-center text-xl">f</button>
              <button className="flex-1 py-3 bg-blue-50 text-sky-500 hover:bg-blue-100 rounded-xl transition flex justify-center items-center text-xl">𝕏</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
