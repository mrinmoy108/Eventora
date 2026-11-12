"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard/attendee");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const router = useRouter();

  // Scroll detection for sticky header styles
  const [scrolled, setScrolled] = useState(false);

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

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans antialiased">
      {/* Sticky Glassmorphic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 px-6 py-4 transition-all duration-300 ${
        scrolled 
          ? "bg-[#0B091E]/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/10 py-3" 
          : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-white font-display tracking-tight hover:scale-102 transition-transform">
            Eventora<span className="text-[#8B5CF6]">.</span>
          </Link>
          <div className="flex gap-4 items-center">
            {isClient && isLoggedIn ? (
              <Link href={dashboardUrl} className="px-5 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] hover:shadow-lg hover:shadow-[#6C3FE8]/20 text-white rounded-xl font-semibold transition-all duration-300">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 text-white/80 hover:text-white font-semibold transition duration-250">
                  Sign In
                </Link>
                <Link href="/register" className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold transition-all duration-350 shadow-lg shadow-black/10 border border-white/15 hover:border-white/30">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Moving mesh background lights */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden flex items-center justify-center min-h-[92vh]">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[#0B091E] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#6C3FE8]/25 blur-[120px] animate-blob"></div>
          <div className="absolute top-[30%] -left-[15%] w-[550px] h-[550px] rounded-full bg-[#E11D48]/15 blur-[130px] animate-blob [animation-delay:4s]"></div>
          <div className="absolute -bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#8B5CF6]/15 blur-[110px] animate-float"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-extrabold tracking-widest uppercase mb-6 animate-float-delayed">
            🎉 The New Standard for Events
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Discover & Create <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#B862F5] to-[#E11D48]">
              Unforgettable
            </span> Moments
          </h1>
          <p className="mt-8 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Eventora is the ultimate workspace to publish gatherings, sell passes, and hire elite photographers, videographers, or managers.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="px-8 py-4 bg-gradient-to-r from-[#6C3FE8] to-[#8B5CF6] hover:from-[#5532b8] hover:to-[#7c3aed] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#6C3FE8]/25 hover:shadow-2xl hover:shadow-[#6C3FE8]/45 transition-all duration-300 hover:-translate-y-1 active:scale-95">
              Explore Events
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-1 active:scale-95">
              Host an Event
            </Link>
          </div>

          {/* Search Bar Glassmorphism Redesign */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams();
              if (searchQuery) params.append('search', searchQuery);
              if (cityQuery) params.append('city', cityQuery);
              router.push(`/events?${params.toString()}`);
            }}
            className="mt-16 mx-auto max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-2 flex flex-col md:flex-row shadow-2xl shadow-black/40 hover:border-white/20 transition-all duration-500 hover:shadow-[#6C3FE8]/10"
          >
            <div className="flex-1 flex items-center px-4 py-3">
              <span className="text-white/40 text-lg mr-3">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, topics, or venues..." 
                className="w-full bg-transparent border-none text-white placeholder-white/40 focus:outline-none focus:ring-0 text-base" 
              />
            </div>
            <div className="w-px h-8 bg-white/15 hidden md:block self-center mx-1"></div>
            <div className="flex-1 flex items-center px-4 py-3">
              <span className="text-white/40 text-lg mr-3">📍</span>
              <input 
                type="text" 
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="City (e.g. Dhaka)" 
                className="w-full bg-transparent border-none text-white placeholder-white/40 focus:outline-none focus:ring-0 text-base" 
              />
            </div>
            <button type="submit" className="bg-[#6C3FE8] hover:bg-[#5532b8] text-white px-8 py-3.5 rounded-[20px] font-bold transition-all duration-300 md:ml-2 cursor-pointer hover:shadow-lg hover:shadow-[#6C3FE8]/30 active:scale-97">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-extrabold text-[#6C3FE8] uppercase tracking-widest block mb-2">Curated Categories</span>
            <h2 className="text-4xl font-extrabold text-[#0B091E] font-display tracking-tight">Explore Categories</h2>
            <p className="mt-2 text-gray-500 font-medium">Find exactly what matches your interest.</p>
          </div>
          <Link href="/events" className="text-[#6C3FE8] font-bold hover:text-[#5532b8] transition-all duration-300 flex items-center gap-1 group">
            View All Events <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Live Music", emoji: "🎸", gradient: "from-[#FFF4F0] to-[#FFEBE3]", border: "hover:border-orange-200", text: "text-orange-600", glow: "hover:shadow-orange-500/10" },
            { name: "Technology", emoji: "💻", gradient: "from-[#F0F5FF] to-[#E5EFFF]", border: "hover:border-blue-200", text: "text-blue-600", glow: "hover:shadow-blue-500/10" },
            { name: "Corporate", emoji: "💼", gradient: "from-[#E8F8F5] to-[#D1F2EB]", border: "hover:border-emerald-200", text: "text-emerald-600", glow: "hover:shadow-emerald-500/10" },
            { name: "Weddings", emoji: "💍", gradient: "from-[#FFF0F5] to-[#FFE3EE]", border: "hover:border-pink-200", text: "text-pink-600", glow: "hover:shadow-pink-500/10" },
          ].map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => router.push(`/events?category=${cat.name}`)}
              className={`bg-gradient-to-br ${cat.gradient} rounded-[32px] p-8 cursor-pointer border border-white/50 shadow-sm transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center group ${cat.border} ${cat.glow} hover:shadow-xl`}
            >
              <div className="text-5xl mb-4 group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">{cat.emoji}</div>
              <h3 className={`font-bold text-lg ${cat.text}`}>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-extrabold text-[#6C3FE8] uppercase tracking-widest block mb-2">What's Hot</span>
              <h2 className="text-4xl font-extrabold text-[#0B091E] font-display tracking-tight">Trending Bangladeshi Events</h2>
              <p className="mt-2 text-gray-500 font-medium">Don't miss out on these upcoming experiences</p>
            </div>
          </div>
          <EventList />
        </div>
      </section>

      {/* Professionals Teaser Section */}
      <section className="py-28 bg-[#0B091E] relative overflow-hidden text-center text-white px-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B091E] via-[#0F0C29] to-[#1D1743] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#6C3FE8]/20 blur-[130px] animate-blob"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#E11D48]/10 blur-[120px] animate-blob [animation-delay:5s]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/10 px-4 py-1.5 rounded-full inline-block mb-6 border border-[#8B5CF6]/20">
            For Event Organizers
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight leading-[1.1] mb-6">
            Need a Photographer <br className="hidden md:inline" /> or Event Manager?
          </h2>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Access our verified network of local professionals. Easily book photographer packages, request custom quotes, and coordinate logistics—all in a unified workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/professionals" 
              className="px-8 py-4 bg-white text-[#0f0c29] rounded-2xl font-bold text-lg hover:bg-gray-50 transition transform hover:-translate-y-1 inline-block shadow-xl shadow-black/25 active:scale-95"
            >
              Recruit Partners
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-4 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-2xl font-bold text-lg transition transform hover:-translate-y-1 inline-block shadow-lg shadow-[#6C3FE8]/15 active:scale-95"
            >
              Join as Professional
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Event List Component to fetch and display events
function EventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[32px] overflow-hidden border border-gray-100 bg-white p-3 space-y-4 shadow-sm">
            <div className="w-full h-56 rounded-2xl shimmer-bg"></div>
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
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-[32px] text-gray-500 font-medium">
        No events found at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {events.map((event: any) => (
        <Link 
          href={`/events/${event.slug}`} 
          key={event.id} 
          className="group cursor-pointer bg-white rounded-[32px] p-3 border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-[#6C3FE8]/5 hover:border-[#6C3FE8]/25 transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5"
        >
          <div className="relative h-60 w-full rounded-2xl overflow-hidden mb-4 bg-gray-50 flex-shrink-0">
            <Image 
              src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark gradient overlay for cards */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#0f0c29] shadow-sm">
              {new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="absolute top-3 left-3 bg-[#6C3FE8] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {event.category?.name || 'Event'}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between px-2 pb-2">
            <div>
              <h3 className="font-bold text-lg text-[#0f0c29] group-hover:text-[#6C3FE8] transition-colors duration-300 line-clamp-1 leading-snug mb-1">
                {event.title}
              </h3>
              <p className="text-gray-500 text-xs font-semibold flex items-center">
                <span className="mr-1 text-sm text-[#6C3FE8]">📍</span> {event.city}, {event.country}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
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
                By <span className="font-bold text-[#0f0c29] ml-1 truncate max-w-[100px]">{event.organizer?.full_name || 'Organizer'}</span>
              </div>
              <span className="text-[10px] font-bold text-[#6C3FE8] bg-[#6C3FE8]/10 group-hover:bg-[#6C3FE8] group-hover:text-white px-2.5 py-1 rounded-lg transition-all duration-300">
                Tickets & Info
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

