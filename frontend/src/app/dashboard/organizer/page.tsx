"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    revenue: 0,
    pendingTeam: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/organizer/stats?organizerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Loading Dashboard Stats...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-display">
            Organizer Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your events, track sales, and hire your team.
          </p>
        </div>
        <Link 
          href="/dashboard/organizer/events/create" 
          className="px-5 py-2.5 bg-[#6C3FE8] text-white rounded-xl font-medium shadow-md hover:bg-[#5532b8] transition flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Create Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Events</h3>
          <p className="mt-4 text-3xl font-extrabold text-[#1A1A2E]">{stats.totalEvents}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Tickets Sold</h3>
          <p className="mt-4 text-3xl font-extrabold text-[#1A1A2E]">{stats.ticketsSold}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Revenue</h3>
          <p className="mt-4 text-3xl font-extrabold text-green-600">
            ৳{stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Pending Team</h3>
          <p className="mt-4 text-3xl font-extrabold text-orange-500">{stats.pendingTeam}</p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/organizer/events/create" className="p-6 bg-white rounded-2xl border border-gray-150 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <span className="text-3xl block mb-3">✨</span>
            <h4 className="font-bold text-gray-800 group-hover:text-[#6C3FE8] transition-colors">Create New Event</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Launch a new event page, define ticket tiers, and start selling tickets instantly.</p>
          </Link>
          <Link href="/dashboard/organizer/events" className="p-6 bg-white rounded-2xl border border-gray-150 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <span className="text-3xl block mb-3">📅</span>
            <h4 className="font-bold text-gray-800 group-hover:text-[#6C3FE8] transition-colors">Manage Events</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">View all your draft and published events, track tickets sold per tier, and view details.</p>
          </Link>
          <Link href="/dashboard/organizer/team" className="p-6 bg-white rounded-2xl border border-gray-150 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <span className="text-3xl block mb-3">🤝</span>
            <h4 className="font-bold text-gray-800 group-hover:text-[#6C3FE8] transition-colors">Event Team</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Manage professional event managers, photographers, and videographers hired for your events.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
