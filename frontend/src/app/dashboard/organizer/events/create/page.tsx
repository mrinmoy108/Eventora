"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"in_person" | "online" | "hybrid">("in_person");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [onlinePlatform, setOnlinePlatform] = useState("");
  const [onlineLink, setOnlineLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload/single", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCoverImageUrl(data.url);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload cover image.");
      }
    } catch (err) {
      console.error(err);
      setError("Error uploading cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
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
        setGallery(prev => [...prev, ...data.urls]);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload gallery images.");
      }
    } catch (err) {
      console.error(err);
      setError("Error uploading gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Ticket tiers states
  const [ticketTiers, setTicketTiers] = useState<any[]>([
    { name: "General Admission", price: "500", quantity_total: "100" }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/meta/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) {
            setCategoryId(data[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddTier = () => {
    setTicketTiers([...ticketTiers, { name: "", price: "", quantity_total: "" }]);
  };

  const handleRemoveTier = (index: number) => {
    if (ticketTiers.length === 1) return;
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: string, value: string) => {
    const updated = [...ticketTiers];
    updated[index][field] = value;
    setTicketTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !startDate || !endDate) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("Event start time must be before event end time.");
      return;
    }

    // Validate ticket tiers
    for (const tier of ticketTiers) {
      if (!tier.name || !tier.price || !tier.quantity_total) {
        setError("Please complete all ticket tier fields.");
        return;
      }
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title,
        categoryId: Number(categoryId),
        organizerId: user.id,
        short_desc: shortDesc,
        description,
        event_type: eventType,
        venue_name: eventType !== "online" ? venueName : "",
        address: eventType !== "online" ? address : "",
        city: eventType !== "online" ? city : "",
        country: eventType !== "online" ? country : "",
        online_platform: eventType !== "in_person" ? onlinePlatform : "",
        online_link: eventType !== "in_person" ? onlineLink : "",
        start_datetime: new Date(startDate).toISOString(),
        end_datetime: new Date(endDate).toISOString(),
        cover_image_url: coverImageUrl || undefined,
        total_capacity: totalCapacity ? Number(totalCapacity) : undefined,
        ticket_tiers: ticketTiers.map(t => ({
          name: t.name,
          price: Number(t.price),
          quantity_total: Number(t.quantity_total)
        })),
        gallery
      };

      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/dashboard/organizer/events");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error creating event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
          Host a New Event
        </h1>
        <p className="mt-2 text-gray-600">
          Set up event details, location details, dates, and create ticket pricing options.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C3FE8]/10 text-[#6C3FE8] flex items-center justify-center text-xs font-bold">1</span>
            Basic Event Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Event Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Sylhet Winter Rock Fest" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Event Category *</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] bg-white font-medium text-gray-700 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cover Image *</label>
              {coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-250 aspect-video group">
                  <img src={coverImageUrl} alt="Cover image preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-750 transition cursor-pointer"
                    >
                      Remove Cover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#6C3FE8] transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                    disabled={uploadingCover}
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer block">
                    <div className="text-3xl mb-1">🖼️</div>
                    <div className="text-xs font-bold text-gray-600">
                      {uploadingCover ? "Uploading Cover..." : "Upload Cover Image (Click to browse)"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Event Gallery Images (Multiple)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {gallery.map((url, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition opacity-0 group-hover:opacity-100 cursor-pointer"
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
                  onChange={handleGalleryUpload}
                  className="hidden"
                  id="gallery-upload"
                  disabled={uploadingGallery}
                />
                <label htmlFor="gallery-upload" className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                  <div className="text-2xl mb-1">📸</div>
                  <div className="text-[10px] font-bold text-gray-500">
                    {uploadingGallery ? "Uploading..." : "Upload Gallery Images"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Short Summary</label>
            <input 
              type="text" 
              placeholder="A brief one-sentence catchphrase for card listings" 
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Event Description</label>
            <textarea 
              rows={4}
              placeholder="Provide a comprehensive outline of the schedule, line-up, guidelines, and benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>
        </div>

        {/* Step 2: Date & Logistics */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C3FE8]/10 text-[#6C3FE8] flex items-center justify-center text-xs font-bold">2</span>
            Event Schedule & Scheduling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date & Time *</label>
              <input 
                type="datetime-local" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date & Time *</label>
              <input 
                type="datetime-local" 
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Location Style */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C3FE8]/10 text-[#6C3FE8] flex items-center justify-center text-xs font-bold">3</span>
            Location / Link Info
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Event Layout Type</label>
            <div className="flex gap-4 mt-2">
              {(["in_person", "online", "hybrid"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold uppercase transition cursor-pointer select-none ${eventType === type ? "bg-[#6C3FE8] border-[#6C3FE8] text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {eventType !== "online" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Venue Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ICCB Hall 4 / Radisson Blu" 
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Street Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Purbachal Expressway" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhaka" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Country</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangladesh" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Total Capacity</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {eventType !== "in_person" && (
            <div className="space-y-4 animate-in fade-in duration-200 border border-dashed border-gray-250 p-4 rounded-xl bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Online Platform</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Zoom / Google Meet" 
                    value={onlinePlatform}
                    onChange={(e) => setOnlinePlatform(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Online Join/Stream Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://zoom.us/j/..." 
                    value={onlineLink}
                    onChange={(e) => setOnlineLink(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Ticket Tiers */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-150 pb-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#6C3FE8]/10 text-[#6C3FE8] flex items-center justify-center text-xs font-bold">4</span>
              Ticket Pricing Tiers
            </h2>
            <button
              type="button"
              onClick={handleAddTier}
              className="px-3 py-1 bg-[#6C3FE8]/10 hover:bg-[#6C3FE8]/25 text-[#6C3FE8] rounded-lg font-bold text-xs transition cursor-pointer select-none"
            >
              + Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {ticketTiers.map((tier, index) => (
              <div key={index} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tier Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VIP / Early Bird" 
                      required
                      value={tier.name}
                      onChange={(e) => handleTierChange(index, "name", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] bg-white font-medium text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (BDT) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      required
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, "price", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] bg-white font-medium text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Capacity/Quantity *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 150" 
                      required
                      value={tier.quantity_total}
                      onChange={(e) => handleTierChange(index, "quantity_total", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] bg-white font-medium text-gray-700"
                    />
                  </div>
                </div>

                {ticketTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(index)}
                    className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer self-end mb-[1px]"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-gray-100 flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer select-none text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-2 py-3 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#6C3FE8]/20 transition cursor-pointer select-none text-center flex items-center justify-center gap-2"
          >
            {submitting ? "Publishing Event..." : "Publish Event Live"}
          </button>
        </div>

      </form>
    </div>
  );
}
