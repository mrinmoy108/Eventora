"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setName(u.full_name || "");
      setEmail(u.email || "");
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    setTimeout(() => {
      setUpdating(false);
      setMessage("Settings updated successfully!");
      if (user) {
        const updatedUser = { ...user, full_name: name, email: email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }, 1000);
  };

  if (!user) {
    return <div className="text-gray-500 font-medium">Loading settings...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
          Account Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Update your profile settings and manage security options.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-250 text-sm font-medium">
          ✓ {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C3FE8] focus:border-[#6C3FE8] font-medium text-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Account Role</label>
          <input 
            type="text" 
            disabled 
            value={user.role ? user.role.toUpperCase() : "USER"}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-bold select-none cursor-not-allowed uppercase"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2.5 bg-[#6C3FE8] hover:bg-[#5532b8] text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer select-none"
          >
            {updating ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
