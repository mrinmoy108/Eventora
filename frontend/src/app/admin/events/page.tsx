'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        setError('Failed to fetch events data.');
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('An error occurred while fetching events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Event deleted successfully.');
        // Clear success message after 4s
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchEvents();
      } else {
        setError(data.error || 'Failed to delete event.');
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('An error occurred while deleting the event.');
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.organizer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.organizer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = 
      filterType === 'all' || 
      event.event_type === filterType;

    return matchesSearch && matchesType;
  });

  const totalEvents = events.length;
  const inPersonCount = events.filter(e => e.event_type === 'in_person').length;
  const onlineCount = events.filter(e => e.event_type === 'online').length;
  const upcomingCount = events.filter(e => new Date(e.start_datetime) > new Date()).length;

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading events management...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Events Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor, search, and manage all events registered on Eventora.</p>
        </div>
      </div>

      {/* Error and Success Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold px-2">×</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-green-800">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700 font-bold px-2">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Upcoming Events</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{upcomingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">In-Person</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{inPersonCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Online</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{onlineCount}</p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title, organizer, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-gray-50/50"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-44 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3FE8]/20 focus:border-[#6C3FE8] text-sm text-gray-700 bg-white"
          >
            <option value="all">All Event Types</option>
            <option value="in_person">In-Person</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/55 text-sm text-gray-500">
                <th className="p-4 font-semibold">Event Info</th>
                <th className="p-4 font-semibold">Organizer</th>
                <th className="p-4 font-semibold">Type / Venue</th>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.start_datetime);
                const isUpcoming = eventDate > new Date();

                return (
                  <tr key={event.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    {/* Event Info */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                            src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{event.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                              ID: {event.id}
                            </span>
                            {isUpcoming ? (
                              <span className="text-[9.5px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Upcoming
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                Past
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Organizer */}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-gray-800">{event.organizer?.full_name}</p>
                      <p className="text-xs text-gray-500">{event.organizer?.email}</p>
                    </td>

                    {/* Type & Venue */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs">
                          {event.event_type === 'in_person' ? '📍' : '💻'}
                        </span>
                        <span className="text-xs font-semibold capitalize text-gray-700">
                          {event.event_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                        {event.venue_name || 'Online / virtual'}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-gray-600">
                      <p className="font-semibold">
                        {eventDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        {eventDate.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/events/edit/${event.id}`}
                        className="px-3 py-1 bg-[#6C3FE8]/10 text-[#6C3FE8] hover:bg-[#6C3FE8] hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm font-medium">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
