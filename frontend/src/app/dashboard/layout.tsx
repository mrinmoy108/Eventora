"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) return <div className="min-h-screen bg-[#F7F6FD] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F7F6FD] flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-[#6C3FE8] font-display">Eventora</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user.full_name}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <nav className="space-y-2">
            <Link
              href={`/dashboard/${user.role === "photographer" || user.role === "event_manager" ? "professional" : user.role}`}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                pathname === `/dashboard/${user.role === "photographer" || user.role === "event_manager" ? "professional" : user.role}`
                  ? "bg-[#6C3FE8] text-white shadow-md shadow-[#6C3FE8]/20"
                  : "text-gray-700 hover:bg-white hover:shadow-sm"
              }`}
            >
              📊 Overview
            </Link>

            <Link
              href="/events"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition"
            >
              🌍 Explore Events
            </Link>

            {user.role === "attendee" && (
              <Link
                href="/dashboard/attendee/tickets"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition"
              >
                🎟️ My Tickets
              </Link>
            )}

            {user.role === "organizer" && (
              <>
                <Link
                  href="/dashboard/organizer/events"
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition"
                >
                  🎪 My Events
                </Link>
                <Link
                  href="/dashboard/organizer/team"
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition"
                >
                  👥 Event Team
                </Link>
              </>
            )}

            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition mt-8"
            >
              ⚙️ Settings
            </Link>
          </nav>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 md:pl-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
