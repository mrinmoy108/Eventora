"use client";

import { useEffect, useState } from "react";

export default function ProfessionalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit form states
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [country, setCountry] = useState("Bangladesh");
  const [basePrice, setBasePrice] = useState("0");
  const [priceUnit, setPriceUnit] = useState("per_event");
  const [specialties, setSpecialties] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/professionals/user/${parsedUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          // Pre-populate edit form fields
          setBio(data.bio || "");
          setCity(data.city || "Dhaka");
          setCountry(data.country || "Bangladesh");
          setBasePrice(data.base_price?.toString() || "0");
          setPriceUnit(data.price_unit || "per_event");
          setSpecialties(data.specialties ? data.specialties.map((s: any) => s.specialty).join(", ") : "");
          setPortfolio(data.portfolio ? data.portfolio.map((p: any) => p.media_url) : []);

          try {
            const token = localStorage.getItem("token");
            const bookingRes = await fetch(`http://localhost:5000/api/bookings/professional?professionalId=${data.id}`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (bookingRes.ok) {
              const bookingsData = await bookingRes.json();
              setBookings(bookingsData);
            }
          } catch (err) {
            console.error("Error fetching bookings:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching professional profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPortfolio(true);
    setError("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch("http://localhost:5000/api/upload/multiple", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPortfolio(prev => [...prev, ...data.urls]);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload portfolio images.");
      }
    } catch (err) {
      console.error(err);
      setError("Error uploading portfolio images.");
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const removePortfolioImage = (indexToRemove: number) => {
    setPortfolio(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    const specialtiesArray = specialties
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      bio,
      city,
      country,
      base_price: Number(basePrice),
      price_unit: priceUnit,
      specialties: specialtiesArray,
      portfolio
    };

    try {
      const res = await fetch(`http://localhost:5000/api/professionals/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditing(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setError("Error saving profile changes.");
    } finally {
      setUpdating(false);
    }
  };
  const handleUpdateStatus = async (bookingId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      } else {
        alert("Failed to update booking status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating booking status");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Loading Dashboard...</div>;
  }

  const activeGigsCount = bookings.filter(b => b.status === 'accepted').length;
  const pendingRequestsCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
            {profile?.pro_type === "photographer" 
              ? "📸 Photographer Dashboard" 
              : profile?.pro_type === "event_manager" 
                ? "💼 Event Manager Dashboard" 
                : "👥 Professional Dashboard"}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your service portfolio, pricing, and showcase your best work.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2.5 bg-[#6C3FE8] hover:bg-[#5532b8] text-white rounded-xl font-medium shadow-md transition cursor-pointer select-none"
          >
            ✏️ Update Profile & Portfolio
          </button>
        )}
      </div>

      {!editing && (
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button 
            className={`pb-3 px-2 font-bold text-sm transition ${activeTab === 'overview' ? 'text-[#6C3FE8] border-b-2 border-[#6C3FE8]' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('overview')}
          >
            Profile Overview
          </button>
          <button 
            className={`pb-3 px-2 font-bold text-sm transition flex items-center gap-2 ${activeTab === 'requests' ? 'text-[#6C3FE8] border-b-2 border-[#6C3FE8]' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('requests')}
          >
            Booking Requests
            {pendingRequestsCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequestsCount}</span>
            )}
          </button>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Profile Details</h2>
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Base Price (BDT) *</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Price Unit *</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] bg-white font-medium text-gray-700 cursor-pointer"
              >
                <option value="per_hour">Per Hour</option>
                <option value="per_day">Per Day</option>
                <option value="per_event">Per Event</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Specialties (Comma-separated)</label>
            <input
              type="text"
              placeholder={profile?.pro_type === "photographer" ? "e.g. Wedding Photography, Portrait, Event Video" : "e.g. Corporate Events, Weddings, Concerts"}
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Bio/About Me</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={profile?.pro_type === "photographer" ? "Tell organizers about your style, gear, experience..." : "Tell organizers about your event coordination experience, team size, past successfully managed events..."}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>

          {/* Portfolio Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Showcase Work / Portfolio Photos (Multiple)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.map((url, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                  <img src={url} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-755 text-white rounded-lg text-xs font-bold shadow-sm transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center p-4 text-center hover:border-[#6C3FE8] transition aspect-video">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePortfolioUpload}
                  className="hidden"
                  id="portfolio-upload"
                  disabled={uploadingPortfolio}
                />
                <label htmlFor="portfolio-upload" className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                  <div className="text-2xl mb-1">📸</div>
                  <div className="text-[10px] font-bold text-gray-500">
                    {uploadingPortfolio ? "Uploading..." : "Upload Portfolio Images"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-2 py-3 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-xl text-sm shadow-lg transition cursor-pointer text-center"
            >
              {updating ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Dashboard Gigs/Earnings metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Gigs</h3>
              <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{activeGigsCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending Requests</h3>
              <p className="mt-2 text-3xl font-bold text-orange-500">{pendingRequestsCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Earnings</h3>
              <p className="mt-2 text-3xl font-bold text-[#6C3FE8]">0 BDT</p>
            </div>
          </div>

          {/* Profile Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-[#F7F6FD]/50 rounded-2xl p-6 border border-gray-100 space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A2E] border-b border-gray-150 pb-3 flex justify-between items-center">
                  <span>👤 Profile Details</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase tracking-wider">
                    Approved Partner
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="text-gray-400 font-medium block">Service City / Country</span>
                    <span className="font-bold text-[#1A1A2E]">{profile?.city || "Dhaka"}, {profile?.country || "Bangladesh"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Base Price / Unit</span>
                    <span className="font-bold text-[#1A1A2E]">
                      {profile?.base_price || 0} BDT / {profile?.price_unit?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400 font-medium block mb-1">Specialties</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile?.specialties && profile.specialties.length > 0 ? (
                        profile.specialties.map((s: any) => (
                          <span key={s.id} className="px-3 py-1 bg-white border border-gray-200 text-gray-650 rounded-full text-xs font-semibold">
                            {s.specialty}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No specialties listed yet.</span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400 font-medium block">Bio / About Me</span>
                    <p className="mt-1 text-gray-700 font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-150">
                      {profile?.bio || (profile?.pro_type === "photographer" 
                        ? "Describe your photography/videography services, style, experience, and tools to help organizers learn more about you." 
                        : "Describe your event management services, packages, coordination style, and past events to help organizers learn more about you.")
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio Showcases */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#1A1A2E] pb-2">🖼️ My Portfolio Gallery ({profile?.portfolio?.length || 0})</h3>
                {profile?.portfolio && profile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.portfolio.map((p: any) => (
                      <div key={p.id} className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video group shadow-sm hover:shadow transition duration-300">
                        <img src={p.media_url} alt="Portfolio showcase" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <div className="text-4xl mb-2">📸</div>
                    <h4 className="font-bold text-[#1A1A2E]">No portfolio images uploaded</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Click 'Update Profile' above to upload files and showcase your past events or work to event organizers.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Booking Requests</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                  <div className="text-4xl mb-2">📥</div>
                  <h4 className="font-bold text-gray-800">No booking requests yet</h4>
                  <p className="text-sm text-gray-500">When organizers want to hire you, their requests will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {bookings.map(booking => {
                    const statusColors: any = {
                      pending: "bg-orange-100 text-orange-700",
                      accepted: "bg-emerald-100 text-emerald-700",
                      declined: "bg-red-100 text-red-700",
                      completed: "bg-blue-100 text-blue-700"
                    };
                    return (
                      <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">{booking.event?.title || 'Unknown Event'}</h4>
                            <p className="text-sm text-gray-500">Date: {new Date(booking.event_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Organizer: <span className="font-normal">{booking.organizer?.full_name}</span></p>
                          <p className="text-sm font-medium text-gray-700">Contact: <span className="font-normal">{booking.organizer?.email}</span></p>
                          <p className="text-sm font-medium text-gray-700">Package: <span className="font-normal">{booking.package?.name || 'Custom Hire'}</span></p>
                          <p className="text-sm font-medium text-gray-700">Price: <span className="font-bold text-emerald-600">{booking.agreed_price ? `৳${booking.agreed_price}` : 'TBD'}</span></p>
                        </div>

                        {booking.message && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 italic mb-6">
                            "{booking.message}"
                          </div>
                        )}

                        {booking.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                            >
                              Accept Request
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'declined')}
                              className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
