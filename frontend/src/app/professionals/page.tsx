"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProfessionalsDirectory() {
  const [activeTab, setActiveTab] = useState<'event_manager' | 'photographers_videographers'>('event_manager');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User auth state for consistent Navbar
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard/attendee");

  // Filter States
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("rating_desc");

  // Fetch Professionals
  const fetchPros = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", activeTab);
      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (specialty) params.append("specialty", specialty);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await fetch(`http://localhost:5000/api/professionals?${params.toString()}`);
      if (res.ok) {
        let data = await res.json();
        
        // Sorting logic client-side
        if (sort === "price_asc") {
          data.sort((a: any, b: any) => parseFloat(a.base_price) - parseFloat(b.base_price));
        } else if (sort === "price_desc") {
          data.sort((a: any, b: any) => parseFloat(b.base_price) - parseFloat(a.base_price));
        } else if (sort === "experience_desc") {
          data.sort((a: any, b: any) => b.years_exp - a.years_exp);
        }

        setProfessionals(data);
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchPros();
  }, [activeTab, sort, specialty]); // Immediate fetch on tab/sort/specialty click

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPros();
  };

  const handleClearFilters = () => {
    setSearch("");
    setCity("");
    setSpecialty("");
    setMinPrice("");
    setMaxPrice("");
    setSort("rating_desc");
    // Tab stays, but everything resets
    setTimeout(() => fetchPros(), 0);
  };

  // Human-readable specialties list for shortcuts
  const popularSpecialties = activeTab === 'event_manager' 
    ? ['Corporate Events', 'Weddings', 'Live Concerts']
    : ['Wedding Photoshoots', 'Portrait Sessions', 'Cinematic Films', 'Drone Videography'];

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans antialiased pb-20">
      
      {/* Sticky Dark Navbar */}
      <nav className="bg-[#0B091E] border-b border-white/5 w-full z-50 px-6 py-4 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-white font-display tracking-tight hover:scale-102 transition-transform">
            Eventora<span className="text-[#8B5CF6]">.</span>
          </Link>
          <div className="flex gap-4 items-center">
            {isClient && isLoggedIn ? (
              <Link href={dashboardUrl} className="px-5 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] hover:shadow-lg hover:shadow-[#6C3FE8]/20 text-white rounded-xl font-semibold transition-all duration-300 text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 text-white/80 hover:text-white font-semibold transition duration-250 text-sm">
                  Sign In
                </Link>
                <Link href="/register" className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold transition shadow-lg shadow-black/10 border border-white/15 hover:border-white/30 text-sm">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section Banner */}
      <section className="bg-[#0B091E] relative pt-24 pb-20 overflow-hidden text-center text-white px-6">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B091E] via-[#0F0C29] to-[#1E1945] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-[50%] -left-[20%] w-[600px] h-[600px] rounded-full bg-[#6C3FE8]/20 blur-[120px] animate-blob"></div>
          <div className="absolute -bottom-[50%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#E11D48]/10 blur-[120px] animate-blob [animation-delay:4s]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/15 px-4 py-1.5 rounded-full inline-block mb-4 border border-[#8B5CF6]/20">
            Elite Vetted Talents
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight leading-none mb-6">
            Hire Top-Tier Event Professionals
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
            Connect with vetted photographers, videographers, and event managers to bring your vision to life.
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex flex-col sm:flex-row shadow-xl hover:border-white/20 transition-all duration-300">
            <input 
              type="text" 
              placeholder="Search by name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:outline-none px-4 py-3 text-sm"
            />
            <div className="w-px h-6 bg-white/15 hidden sm:block self-center mx-1"></div>
            <input 
              type="text" 
              placeholder="City (e.g. Dhaka)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="sm:w-44 bg-transparent border-t sm:border-t-0 sm:border-l border-white/10 text-white placeholder-white/40 focus:outline-none px-4 py-3 text-sm"
            />
            <button type="submit" className="bg-[#6C3FE8] hover:bg-[#5532b8] hover:shadow-lg hover:shadow-[#6C3FE8]/20 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 text-sm mt-2 sm:mt-0 active:scale-97">
              Find Pros
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12 relative z-10 animate-fade-in-up">
        
        {/* Role Tab Selector & Sort Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-5 gap-4">
          <div className="bg-gray-100/80 p-1.5 rounded-[22px] flex gap-1 select-none border border-gray-200/50 shadow-inner">
            <button 
              onClick={() => {
                setActiveTab('event_manager');
                setSpecialty("");
              }}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'event_manager' 
                  ? 'bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/15' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              💼 Event Managers
            </button>
            <button 
              onClick={() => {
                setActiveTab('photographers_videographers');
                setSpecialty("");
              }}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'photographers_videographers' 
                  ? 'bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/15' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              📸 Photographers & Videographers
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Sort By</label>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 shadow-sm cursor-pointer"
            >
              <option value="rating_desc">⭐ Top Rated</option>
              <option value="price_asc">৳ Price: Low to High</option>
              <option value="price_desc">৳ Price: High to Low</option>
              <option value="experience_desc">⏳ Experience: High to Low</option>
            </select>
          </div>
        </div>

        {/* Popular Specialty Tags Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mr-2">Specialty:</span>
          <button 
            onClick={() => setSpecialty("")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-250 cursor-pointer border ${
              !specialty 
                ? 'bg-[#6C3FE8] text-white border-transparent shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200/80 hover:border-gray-300'
            }`}
          >
            All Specialties
          </button>
          {popularSpecialties.map((spec) => (
            <button 
              key={spec}
              onClick={() => setSpecialty(spec)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-250 cursor-pointer border ${
                specialty === spec 
                  ? 'bg-[#6C3FE8] text-white border-transparent shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200/80 hover:border-gray-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Main Grid Layout: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          
          {/* Filters Sidebar */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-fit space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <h3 className="font-extrabold text-lg text-[#0B091E]">Filters</h3>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#6C3FE8] hover:text-[#5532b8] transition cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Price Range Slider Inputs */}
            <div>
              <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-3">Price Range (BDT)</h4>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 placeholder-gray-300"
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 placeholder-gray-300"
                />
              </div>
            </div>

            {/* City Lookup */}
            <div>
              <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">Location</h4>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                <input 
                  type="text" 
                  placeholder="e.g. Dhaka or Chittagong" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 placeholder-gray-300"
                />
              </div>
            </div>

            {/* Apply filters button */}
            <button 
              onClick={fetchPros}
              className="w-full py-3 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-md shadow-[#6C3FE8]/15 hover:shadow-lg active:scale-97"
            >
              Apply Filters
            </button>
          </div>

          {/* Results Cards List */}
          <div className="lg:col-span-3">
            {loading ? (
              /* Shimmer skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden p-5 space-y-4 shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-full shimmer-bg flex-shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="w-2/3 h-5 rounded shimmer-bg"></div>
                        <div className="w-1/3 h-4 rounded shimmer-bg"></div>
                      </div>
                    </div>
                    <div className="w-full h-12 rounded-xl shimmer-bg"></div>
                    <div className="flex gap-1.5 pt-2">
                      <div className="w-14 h-5 rounded-full shimmer-bg"></div>
                      <div className="w-14 h-5 rounded-full shimmer-bg"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div className="w-20 h-5 rounded shimmer-bg"></div>
                      <div className="w-20 h-8 rounded-xl shimmer-bg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-24 bg-white border border-gray-100 rounded-[32px] shadow-sm px-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0B091E]">No professionals found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium text-sm">
                  Try adjusting your search criteria, price parameters, or location tags to expand results.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/50 rounded-xl text-xs font-bold transition text-gray-700 cursor-pointer"
                >
                  Reset Directory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((pro) => (
                  <div 
                    key={pro.id} 
                    className="bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#6C3FE8]/5 hover:border-[#6C3FE8]/20 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 group"
                  >
                    <div>
                      {/* Photo & Basic Details */}
                      <div className="p-5 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative border-2 border-white shadow flex-shrink-0">
                          {pro.user?.avatar_url ? (
                            <Image 
                              src={pro.user.avatar_url} 
                              alt={pro.user.full_name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white text-xl font-bold font-display">
                              {pro.user?.full_name?.charAt(0) || 'P'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-[#0B091E] text-base leading-tight truncate group-hover:text-[#6C3FE8] transition-colors">
                            {pro.user?.full_name || 'Professional Partner'}
                          </h3>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-extrabold uppercase tracking-wider">
                            {pro.pro_type === 'event_manager' ? '💼 Manager' : '📸 Photographer'}
                          </span>
                        </div>
                      </div>

                      {/* Bio & Details */}
                      <div className="px-5 pb-4 border-b border-gray-50">
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                          {pro.bio || 'Vetted professional ready to manage or capture your next event.'}
                        </p>

                        <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap mt-4 text-[10px] font-bold text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">📍 {pro.city}</span>
                          <span className="flex items-center gap-1 bg-yellow-50/50 text-yellow-700 px-2 py-1 rounded-md">⭐ {pro.avg_rating} <span className="text-gray-400">({pro.review_count})</span></span>
                          <span className="flex items-center gap-1 bg-purple-50/50 text-purple-700 px-2 py-1 rounded-md">⏳ {pro.years_exp} yrs</span>
                        </div>
                      </div>

                      {/* Specialties List */}
                      <div className="p-5 flex flex-wrap gap-1.5">
                        {pro.specialties?.slice(0, 3).map((spec: any) => (
                          <span key={spec.id} className="text-[10px] font-extrabold bg-gray-100/80 text-gray-600 px-2.5 py-1 rounded-full border border-gray-150">
                            {spec.specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Booking Price & CTA */}
                    <div className="bg-gray-50/80 px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Starting Price</span>
                        <div className="font-black text-[#0B091E] text-base leading-none mt-0.5">
                          ৳{parseFloat(pro.base_price).toLocaleString('en-US')}
                          <span className="text-[10px] text-gray-400 font-semibold">/{pro.price_unit === 'per_day' ? 'day' : 'event'}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/professionals/${pro.id}`}
                        className="px-4 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#6C3FE8]/10 active:scale-95"
                      >
                        View Profile
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
