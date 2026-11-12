"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("All Categories");

  // Read URL search params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get('search') || '';
    const initialCategory = params.get('category') || 'All Categories';
    
    setSearchQuery(initialSearch);
    setCategoryQuery(initialCategory);
    
    fetchEvents(initialSearch, initialCategory);
  }, []);

  const fetchEvents = (search: string, category: string) => {
    setLoading(true);
    const urlParams = new URLSearchParams();
    if (search) urlParams.append('search', search);
    if (category && category !== 'All Categories') urlParams.append('category', category);
    
    const city = new URLSearchParams(window.location.search).get('city');
    if (city) urlParams.append('city', city);

    fetch(`http://localhost:5000/api/events?${urlParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error("Backend returned an error or non-array:", data);
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategoryQuery(newCat);
    fetchEvents(searchQuery, newCat);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchEvents(searchQuery, categoryQuery);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans antialiased">
      {/* Sticky Dark Navbar */}
      <nav className="bg-[#0B091E] border-b border-white/5 w-full z-50 px-6 py-4 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-white font-display tracking-tight hover:scale-102 transition-transform">
            Eventora<span className="text-[#8B5CF6]">.</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition duration-250 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Decorative background blurs */}
      <div className="absolute top-20 left-0 w-full h-[350px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#6C3FE8]/5 blur-[80px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#E11D48]/5 blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 animate-fade-in-up">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-xs font-extrabold text-[#6C3FE8] uppercase tracking-widest block mb-2">Happening Soon</span>
            <h1 className="text-4xl md:text-5xl font-black text-[#0B091E] font-display tracking-tight">Explore Events</h1>
            <p className="mt-2 text-gray-500 font-medium text-base">Discover incredible experiences happening around you.</p>
          </div>
          
          {/* Filters Row */}
          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:flex-initial">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by keywords..." 
                className="pl-9 pr-4 py-3 rounded-2xl border border-gray-200/85 focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/30 focus:border-[#6C3FE8] w-full md:w-60 shadow-sm bg-white font-medium text-sm transition-all duration-300"
              />
            </div>
            <select 
              value={categoryQuery}
              onChange={handleCategoryChange}
              className="px-4 py-3 rounded-2xl border border-gray-200/85 focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/30 focus:border-[#6C3FE8] shadow-sm bg-white font-bold text-sm cursor-pointer transition-all duration-300 text-gray-700"
            >
              <option>All Categories</option>
              <option>Live Music</option>
              <option>Technology</option>
              <option>Corporate</option>
              <option>Weddings</option>
            </select>
          </div>
        </div>

        {loading ? (
          /* Shimmer skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-[32px] overflow-hidden border border-gray-100 bg-white p-3 space-y-4 shadow-sm">
                <div className="w-full h-52 rounded-2xl shimmer-bg"></div>
                <div className="px-2 space-y-3">
                  <div className="w-3/4 h-5 rounded-md shimmer-bg"></div>
                  <div className="w-1/2 h-4 rounded-md shimmer-bg"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full shimmer-bg"></div>
                      <div className="w-20 h-4 rounded-md shimmer-bg"></div>
                    </div>
                    <div className="w-16 h-6 rounded shimmer-bg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-28 bg-white rounded-[32px] border border-gray-100 shadow-sm px-6">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold text-[#0B091E]">No events found</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto font-medium">Try adjusting your filters, searching a different keyword, or host your own event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {events.map((event: any) => (
              <Link 
                href={`/events/${event.slug}`} 
                key={event.id} 
                className="group cursor-pointer bg-white rounded-[32px] p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#6C3FE8]/5 hover:border-[#6C3FE8]/25 transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5"
              >
                <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-4 bg-gray-50 flex-shrink-0">
                  <Image 
                    src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#0f0c29] shadow-sm">
                    {new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="absolute top-3 left-3 bg-[#6C3FE8] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {event.category?.name || 'Event'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between px-2 pb-2">
                  <div>
                    <h3 className="font-bold text-lg text-[#0f0c29] group-hover:text-[#6C3FE8] transition-colors duration-300 line-clamp-2 leading-snug mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-500 text-xs font-semibold flex items-center mb-4">
                      <span className="mr-1 text-sm text-[#6C3FE8]">📍</span> {event.city}, {event.country}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden mr-2 border border-white shadow-sm flex-shrink-0">
                        {event.organizer?.avatar_url ? (
                           <img src={event.organizer.avatar_url} alt="Organizer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white text-[10px] font-bold">
                            {event.organizer?.full_name?.charAt(0) || 'O'}
                          </div>
                        )}
                      </div>
                      By <span className="font-bold text-[#0f0c29] ml-1 truncate max-w-[80px]">{event.organizer?.full_name || 'Organizer'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6C3FE8] bg-[#6C3FE8]/10 group-hover:bg-[#6C3FE8] group-hover:text-white px-3 py-1.5 rounded-lg transition-all duration-300">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
