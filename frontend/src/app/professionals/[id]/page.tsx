"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProfessionalProfilePage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');

  // User auth state
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Booking form states
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sticky navbar state
  const [scrolled, setScrolled] = useState(false);

  // Fetch Professional Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/professionals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfessional(data);
        } else {
          console.error("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading professional:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Fetch User and Organizer events
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.role === "organizer") {
        setEventsLoading(true);
        fetch(`http://localhost:5000/api/events?organizerId=${parsedUser.id}`)
          .then(res => res.ok ? res.json() : [])
          .then(events => {
            setOrganizerEvents(events);
            if (events.length > 0) {
              setSelectedEventId(String(events[0].id));
            }
          })
          .catch(err => console.error("Error loading organizer events:", err))
          .finally(() => setEventsLoading(false));
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "organizer") {
      alert("Only event organizers can submit booking requests.");
      return;
    }
    if (!selectedEventId || !bookingDate) {
      alert("Please select a target event and a date for the booking.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmittingBooking(true);
    try {
      const payload = {
        organizerId: user.id,
        professionalId: professional.id,
        eventId: Number(selectedEventId),
        packageId: selectedPackageId ? Number(selectedPackageId) : null,
        message: bookingMessage,
        eventDate: bookingDate
      };

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookingSuccess(true);
        setBookingMessage("");
        setBookingDate("");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Booking failed.");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      alert("An error occurred during booking creation.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-[#FAF9FF] text-gray-500 font-medium">
        <div className="w-10 h-10 border-4 border-[#6C3FE8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500">Loading profile details...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-[#FAF9FF] text-center px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-[#0B091E] font-display">Professional Not Found</h2>
        <p className="text-gray-500 mt-2 max-w-sm">The requested professional profile does not exist or has not been approved.</p>
        <Link href="/professionals" className="mt-6 px-6 py-2.5 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-xl font-bold shadow-md transition-all">
          Back to Directory
        </Link>
      </div>
    );
  }

  const basePrice = parseFloat(professional.base_price);

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans antialiased pb-20">

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
            {isClient && user ? (
              <Link href={user.role === 'organizer' ? '/dashboard/organizer' : user.role === 'attendee' ? '/dashboard/attendee' : '/dashboard/professional'} className="px-5 py-2 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-xl font-semibold transition-all duration-300 text-sm">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-5 py-2 text-white/80 hover:text-white font-semibold transition duration-250 text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Top Banner / Cover */}
      <section className="bg-[#0B091E] h-60 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B091E] via-[#0F0C29] to-[#1F1948] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-[50%] right-[10%] w-[550px] h-[550px] rounded-full bg-[#6C3FE8]/25 blur-[100px] animate-blob"></div>
        </div>
      </section>

      {/* Main Profile Content Shell */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Core Profile Info & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Identity Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                
                {/* Profile Pic */}
                <div className="w-28 h-28 rounded-full overflow-hidden relative border-4 border-white shadow-lg bg-gray-50 flex-shrink-0">
                  {professional.user?.avatar_url ? (
                    <Image 
                      src={professional.user.avatar_url} 
                      alt={professional.user?.full_name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white text-3xl font-bold font-display">
                      {professional.user?.full_name?.charAt(0) || 'P'}
                    </div>
                  )}
                </div>

                {/* Text Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0B091E] font-display truncate">
                      {professional.user?.full_name}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[9px] font-extrabold uppercase tracking-wider border border-purple-100/50">
                      {professional.pro_type === 'event_manager' ? '💼 Event Manager' : '📸 Photographer'}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-xl font-medium">
                    {professional.bio || 'Vetted event professional partner.'}
                  </p>

                  <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-5 text-[11px] font-bold text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">📍 {professional.city}, {professional.country}</span>
                    <span className="flex items-center gap-1.5 bg-purple-50/50 text-purple-700 px-2.5 py-1 rounded-lg">⏳ {professional.years_exp} Years Exp</span>
                    <span className="flex items-center gap-1.5 bg-yellow-50/80 text-yellow-700 px-2.5 py-1 rounded-lg">⭐ {professional.avg_rating} <span className="text-gray-400 font-semibold">({professional.review_count} reviews)</span></span>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-4 text-[11px] font-bold text-gray-400">
                    {professional.user?.email && (
                      <span className="flex items-center gap-1.5">✉️ <a href={`mailto:${professional.user.email}`} className="text-[#6C3FE8] hover:underline font-semibold">{professional.user.email}</a></span>
                    )}
                    {professional.user?.phone && (
                      <span className="flex items-center gap-1.5">📞 <a href={`tel:${professional.user.phone}`} className="text-[#6C3FE8] hover:underline font-semibold">{professional.user.phone}</a></span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Navigation Tabs Selector */}
            <div className="bg-white rounded-2xl border border-gray-150 p-1 flex shadow-sm">
              <button 
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'about' 
                    ? 'bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/15' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                About & Packages
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'portfolio' 
                    ? 'bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/15' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Portfolio ({professional.portfolio?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'reviews' 
                    ? 'bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/15' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Reviews ({professional.reviews?.length || 0})
              </button>
            </div>

            {/* TAB CONTENT: ABOUT & PACKAGES */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Specialties */}
                <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0B091E] mb-4 font-display">Specialties & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties?.map((spec: any) => (
                      <span key={spec.id} className="bg-gray-50 border border-gray-150 text-gray-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                        {spec.specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Packages */}
                <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0B091E] mb-6 font-display">Service Packages</h2>
                  <div className="space-y-4">
                    {professional.packages?.map((pkg: any) => (
                      <div 
                        key={pkg.id} 
                        className={`border rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                          selectedPackageId === String(pkg.id)
                            ? 'border-[#6C3FE8] bg-purple-50/15 shadow-md shadow-[#6C3FE8]/5'
                            : 'border-gray-150 hover:border-[#6C3FE8] bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-[#0B091E] text-base">{pkg.name}</h3>
                            {selectedPackageId === String(pkg.id) && (
                              <span className="bg-[#6C3FE8] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">Selected</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 max-w-lg leading-relaxed font-medium">{pkg.description}</p>
                          
                          {pkg.inclusions && (
                            <div className="pt-2">
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Inclusions:</span>
                              <p className="text-xs text-gray-600 font-semibold mt-0.5">{pkg.inclusions}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-left sm:text-right flex-shrink-0 flex flex-col justify-between h-full min-h-[90px]">
                          <div>
                            {pkg.duration_hours && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100/50 px-2.5 py-0.5 rounded font-extrabold inline-block mb-1.5">
                                ⏳ {pkg.duration_hours} hrs coverage
                              </span>
                            )}
                            <div className="font-black text-[#0B091E] text-xl">
                              ৳{parseFloat(pkg.price).toLocaleString('en-US')}
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setSelectedPackageId(String(pkg.id));
                              // Scroll side container into view on mobile
                              const target = document.getElementById("booking-box");
                              if (target) {
                                target.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                            className={`mt-4 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer w-full text-center active:scale-95 ${
                              selectedPackageId === String(pkg.id) 
                                ? 'bg-[#6C3FE8] text-white border-transparent shadow-md shadow-[#6C3FE8]/15' 
                                : 'bg-white text-[#6C3FE8] border-gray-200 hover:border-[#6C3FE8]'
                            }`}
                          >
                            {selectedPackageId === String(pkg.id) ? 'Selected Package' : 'Select Package'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm animate-fade-in-up">
                <h2 className="text-lg font-extrabold text-[#0B091E] mb-6 font-display">Featured Projects Portfolio</h2>
                {professional.portfolio?.length === 0 ? (
                  <p className="text-gray-400 text-sm py-12 text-center font-medium">No portfolio assets added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {professional.portfolio?.map((item: any) => (
                      <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-[4/3] bg-gray-50 hover:shadow-lg transition-all duration-300">
                        <Image 
                          src={item.media_url} 
                          alt={item.caption || "Portfolio item"}
                          fill
                          sizes="(max-width: 768px) 100vw, 35vw"
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        {item.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                            <p className="text-sm font-semibold truncate">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm space-y-6 animate-fade-in-up">
                <h2 className="text-lg font-extrabold text-[#0B091E] mb-6 font-display">Organizer Reviews</h2>
                {professional.reviews?.length === 0 ? (
                  <p className="text-gray-400 text-sm py-12 text-center font-medium">No reviews submitted yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {professional.reviews?.map((rev: any) => (
                      <div key={rev.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border shadow-sm">
                              {rev.reviewer?.avatar_url ? (
                                <Image src={rev.reviewer.avatar_url} alt={rev.reviewer.full_name} fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                                  {rev.reviewer?.full_name?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#0B091E] text-sm">{rev.reviewer?.full_name}</h4>
                              <span className="text-[10px] text-gray-400 font-bold">
                                {new Date(rev.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                              </span>
                            </div>
                          </div>

                          <div className="text-yellow-700 font-extrabold text-xs bg-yellow-50 border border-yellow-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                            ⭐ {rev.rating}
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs mt-3.5 leading-relaxed font-medium">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right sidebar - Booking Form Panel */}
          <div id="booking-box" className="space-y-6">
            
            {/* Quick Profile Summary Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Verified Partner
              </span>
              <div className="font-black text-[#0B091E] text-3xl leading-none">
                ৳{basePrice.toLocaleString('en-US')}
                <span className="text-xs text-gray-400 font-semibold">/{professional.price_unit === 'per_day' ? 'day' : 'event'}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Base standard package rate</p>
            </div>

            {/* Booking Form Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
              <h3 className="font-extrabold text-lg text-[#0B091E] mb-4 font-display">Schedule Booking</h3>
              
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">📬</div>
                  <h4 className="font-extrabold text-green-600 text-base">Request Submitted!</h4>
                  <p className="text-xs text-gray-500 mt-2 max-w-[220px] mx-auto font-medium">
                    Your booking request is pending. The professional will review your invitation and contact you shortly.
                  </p>
                  <button 
                    onClick={() => setBookingSuccess(false)}
                    className="mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : !user ? (
                /* Login CTA */
                <div className="text-center py-4 bg-gray-50/50 border border-gray-150 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-3.5 font-medium">Please sign in to schedule a booking.</p>
                  <Link 
                    href="/login"
                    className="block w-full py-2.5 bg-[#0B091E] hover:bg-black text-white text-xs font-bold rounded-xl text-center shadow-md transition-all active:scale-95"
                  >
                    Sign In
                  </Link>
                </div>
              ) : user.role !== "organizer" ? (
                /* Role warning */
                <div className="text-center py-4 bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-xs text-gray-500 font-medium leading-relaxed">
                  ⚠️ Booking is only available for event organizers. Log in with an organizer profile to recruit this partner.
                </div>
              ) : (
                /* Organizer Booking Form */
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Selected Event (dropdown list) */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Target Event</label>
                    {eventsLoading ? (
                      <div className="text-xs text-gray-400 py-2">Loading organizer events...</div>
                    ) : organizerEvents.length === 0 ? (
                      <div className="text-xs text-gray-400 py-2 leading-relaxed">
                        No events created. Please create an event first in your dashboard before booking.
                      </div>
                    ) : (
                      <select 
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 shadow-sm cursor-pointer"
                      >
                        {organizerEvents.map((ev: any) => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Selected Package Selector */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Select Package</label>
                    <select 
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 shadow-sm cursor-pointer"
                    >
                      <option value="">Custom Package / Hire details</option>
                      {professional.packages?.map((pkg: any) => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name} (৳{parseFloat(pkg.price).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  {/* Booking Date */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Booking Date</label>
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 shadow-sm cursor-pointer text-gray-700 font-bold"
                    />
                  </div>

                  {/* Message details */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Custom Message / Request</label>
                    <textarea 
                      placeholder="Detail your event plans and timeline..."
                      rows={3}
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 shadow-sm placeholder-gray-300 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={submittingBooking || organizerEvents.length === 0}
                    className="w-full py-3 bg-[#6C3FE8] hover:bg-[#5532b8] disabled:bg-gray-150 disabled:text-gray-400 text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-md shadow-[#6C3FE8]/15 hover:shadow-lg active:scale-97"
                  >
                    {submittingBooking ? "Submitting Request..." : "Book Professional"}
                  </button>

                </form>
              )}

            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
