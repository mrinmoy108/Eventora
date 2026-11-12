'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  const links = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Professionals', path: '/admin/professionals' },
    { name: 'Events', path: '/admin/events' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Payments', path: '/admin/payments' },
    { name: 'Reviews', path: '/admin/reviews' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <Link href="/">
            <span className="text-2xl font-bold text-[#6C3FE8] cursor-pointer">
              Eventora Admin
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <span
                  className={`block px-4 py-2 rounded-lg cursor-pointer ${
                    isActive
                      ? 'bg-[#6C3FE8] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
