import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial platform settings...');

  await prisma.platformSetting.upsert({
    where: { setting_key: 'platform_name' },
    update: {},
    create: {
      setting_key: 'platform_name',
      setting_value: 'Eventora',
    },
  });

  await prisma.platformSetting.upsert({
    where: { setting_key: 'platform_commission_percent' },
    update: {},
    create: {
      setting_key: 'platform_commission_percent',
      setting_value: '5.00',
    },
  });

  const categories = [
    { name: 'Music', slug: 'music', color_hex: '#FF5E62' },
    { name: 'Tech', slug: 'tech', color_hex: '#6C3FE8' },
    { name: 'Corporate', slug: 'corporate', color_hex: '#3B82F6' },
    { name: 'Wedding', slug: 'wedding', color_hex: '#EC4899' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Seeding complete!');
  
  console.log('Seeding Bangladeshi Events...');
  
  // Create a dummy organizer user to own the events
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventora.bd' },
    update: {},
    create: {
      full_name: 'Eventora BD Organizer',
      email: 'organizer@eventora.bd',
      password_hash: 'dummyhash',
      role: 'organizer',
      is_verified: true,
    },
  });

  const bangladeshiEvents = [
    {
      title: 'Dhaka Rock Fest 2026',
      slug: 'dhaka-rock-fest-2026',
      description: 'The biggest rock festival in Bangladesh! Featuring top bands from across the country.',
      categoryId: 1, // Music
      organizerId: organizer.id,
      start_datetime: new Date('2026-08-15T18:00:00Z'),
      end_datetime: new Date('2026-08-15T23:59:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'ICCB',
      address: 'ICCB, Dhaka',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1540039155733-d76e6c484940?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Cox\'s Bazar Beach Party',
      slug: 'coxs-bazar-beach-party-2026',
      description: 'Experience an unforgettable night of EDM and fireworks right on the longest sea beach in the world.',
      categoryId: 1, // Music
      organizerId: organizer.id,
      start_datetime: new Date('2026-12-31T20:00:00Z'),
      end_datetime: new Date('2027-01-01T03:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Inani Beach',
      address: 'Inani Beach',
      city: 'Cox\'s Bazar',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Sylhet Tech Summit',
      slug: 'sylhet-tech-summit',
      description: 'A 2-day conference bringing together the brightest minds in software engineering, AI, and startups in Sylhet.',
      categoryId: 2, // Tech
      organizerId: organizer.id,
      start_datetime: new Date('2026-09-10T09:00:00Z'),
      end_datetime: new Date('2026-09-11T18:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Grand Sylhet Hotel',
      address: 'Grand Sylhet Hotel',
      city: 'Sylhet',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Chittagong Trade Fair',
      slug: 'chittagong-trade-fair',
      description: 'The annual international trade fair showcasing products and innovations from over 50 countries.',
      categoryId: 3, // Corporate
      organizerId: organizer.id,
      start_datetime: new Date('2026-11-01T10:00:00Z'),
      end_datetime: new Date('2026-11-30T22:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Railway Polo Ground',
      address: 'Railway Polo Ground',
      city: 'Chittagong',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Dhaka Art Summit',
      slug: 'dhaka-art-summit-2026',
      description: 'The largest contemporary art platform in South Asia, featuring exhibitions, panels, and performances.',
      categoryId: 4, // Weddings/Arts
      organizerId: organizer.id,
      start_datetime: new Date('2026-02-05T09:00:00Z'),
      end_datetime: new Date('2026-02-13T20:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Shilpakala Academy',
      address: 'Segunbagicha',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'BPL 2026 Final',
      slug: 'bpl-2026-final',
      description: 'The highly anticipated final match of the Bangladesh Premier League T20 cricket tournament.',
      categoryId: 1, 
      organizerId: organizer.id,
      start_datetime: new Date('2026-03-01T18:00:00Z'),
      end_datetime: new Date('2026-03-01T23:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Sher-e-Bangla National Cricket Stadium',
      address: 'Mirpur',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Sajek Valley Escape',
      slug: 'sajek-valley-escape',
      description: 'A 3-day premium group tour to the clouds of Sajek Valley with luxury transport and resorts.',
      categoryId: 3, 
      organizerId: organizer.id,
      start_datetime: new Date('2026-07-20T22:00:00Z'),
      end_datetime: new Date('2026-07-23T20:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Sajek Valley',
      address: 'Sajek',
      city: 'Rangamati',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Joy Bangla Concert',
      slug: 'joy-bangla-concert-2026',
      description: 'The iconic tribute concert featuring the legends of Bangladeshi rock music.',
      categoryId: 1, // Music
      organizerId: organizer.id,
      start_datetime: new Date('2026-03-07T15:00:00Z'),
      end_datetime: new Date('2026-03-07T23:30:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Army Stadium',
      address: 'Banani',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Bangladesh IT Expo 2026',
      slug: 'bangladesh-it-expo-2026',
      description: 'The premier technology and innovation exhibition in Dhaka.',
      categoryId: 2, // Tech
      organizerId: organizer.id,
      start_datetime: new Date('2026-08-20T10:00:00Z'),
      end_datetime: new Date('2026-08-22T20:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'BICC',
      address: 'Agargaon',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Kuakata Beach Festival',
      slug: 'kuakata-beach-festival-2026',
      description: 'A vibrant coastal festival celebrating culture and music at the daughter of the sea.',
      categoryId: 1, // Music
      organizerId: organizer.id,
      start_datetime: new Date('2026-11-15T16:00:00Z'),
      end_datetime: new Date('2026-11-17T23:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'Kuakata Beach',
      address: 'Kuakata',
      city: 'Patuakhali',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop',
    },
    {
      title: 'Dhaka Auto Show 2026',
      slug: 'dhaka-auto-show-2026',
      description: 'The biggest automotive exhibition showcasing the latest cars and bikes in Bangladesh.',
      categoryId: 3, // Corporate
      organizerId: organizer.id,
      start_datetime: new Date('2026-10-01T10:00:00Z'),
      end_datetime: new Date('2026-10-05T20:00:00Z'),
      event_type: 'in_person' as any,
      venue_name: 'ICCB',
      address: 'Bashundhara',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'published' as any,
      cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop',
    }
  ];

  for (const ev of bangladeshiEvents) {
    const { categoryId, organizerId, ...eventData } = ev;
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: {
        title: eventData.title,
        description: eventData.description,
        cover_image_url: eventData.cover_image_url
      },
      create: {
        ...eventData,
        category: { connect: { id: categoryId } },
        organizer: { connect: { id: organizerId } },
        ticket_tiers: {
          create: [
            { name: 'General Admission', price: 500, quantity_total: 1000 },
            { name: 'VIP', price: 1500, quantity_total: 200 }
          ]
        }
      },
    });
  }

  console.log('Bangladeshi Events Seeded!');

  console.log('Seeding initial professionals...');

  // 1. Rafiqul Islam (Event Manager)
  const proUser1 = await prisma.user.upsert({
    where: { email: 'rafiqul@eventora.bd' },
    update: {},
    create: {
      full_name: 'Rafiqul Islam',
      email: 'rafiqul@eventora.bd',
      password_hash: 'dummyhash',
      role: 'event_manager',
      is_verified: true,
      phone: '01711122233',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'
    }
  });

  await prisma.professional.upsert({
    where: { user_id: proUser1.id },
    update: {},
    create: {
      user_id: proUser1.id,
      pro_type: 'event_manager',
      bio: 'Experienced corporate and social event manager. Over 8 years of organizing conferences, high-end weddings, and music festivals in Dhaka.',
      city: 'Dhaka',
      country: 'Bangladesh',
      base_price: 15000,
      price_unit: 'per_event',
      years_exp: 8,
      is_approved: true,
      is_available: true,
      avg_rating: 4.9,
      review_count: 14,
      specialties: {
        create: [
          { specialty: 'Corporate Events' },
          { specialty: 'Weddings' },
          { specialty: 'Live Concerts' }
        ]
      },
      packages: {
        create: [
          {
            name: 'Silver Management Package',
            description: 'On-day event coordination, vendor management, and basic decorations planning.',
            price: 15000,
            duration_hours: 8,
            inclusions: '1 Lead Manager, On-day Coordination, Vendor Verification'
          },
          {
            name: 'Gold Full Event Planning',
            description: 'End-to-end planning including venue selection, vendor hiring, decorations styling, and full execution.',
            price: 35000,
            inclusions: 'Full Coordination, Venue Selection Assistance, Decoration Designing, 2 Assistant Managers'
          }
        ]
      },
      portfolio: {
        create: [
          { media_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865', caption: 'Tech Conference 2025' },
          { media_url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a', caption: 'Grand Wedding Styling' }
        ]
      }
    }
  });

  // 2. Tahmid Zaman (Photographer)
  const proUser2 = await prisma.user.upsert({
    where: { email: 'tahmid@eventora.bd' },
    update: {},
    create: {
      full_name: 'Tahmid Zaman',
      email: 'tahmid@eventora.bd',
      password_hash: 'dummyhash',
      role: 'photographer',
      is_verified: true,
      phone: '01822233344',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop'
    }
  });

  await prisma.professional.upsert({
    where: { user_id: proUser2.id },
    update: {},
    create: {
      user_id: proUser2.id,
      pro_type: 'photographer',
      bio: 'Professional wedding and fashion photographer. Capturing precious moments and aesthetic visual stories for 5 years.',
      city: 'Dhaka',
      country: 'Bangladesh',
      base_price: 8000,
      price_unit: 'per_day',
      years_exp: 5,
      is_approved: true,
      is_available: true,
      avg_rating: 4.8,
      review_count: 22,
      specialties: {
        create: [
          { specialty: 'Wedding Photoshoots' },
          { specialty: 'Portrait Sessions' },
          { specialty: 'Product Photography' }
        ]
      },
      packages: {
        create: [
          {
            name: 'Basic Portraits & Events',
            description: 'Half day coverage, basic editing, and delivery of 100 digital files.',
            price: 8000,
            duration_hours: 4,
            inclusions: '1 Photographer, 100 Edited Photos, Digital Delivery'
          },
          {
            name: 'Premium Wedding Story',
            description: 'Full day coverage by 2 photographers, premium retouching, print prints, and a custom wedding photo album.',
            price: 25000,
            duration_hours: 10,
            inclusions: '2 Photographers, Unlimited Digital Photos, 50 Printed Retouched Photos, Wedding Album'
          }
        ]
      },
      portfolio: {
        create: [
          { media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552', caption: 'Beachside Wedding Shoot' },
          { media_url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74', caption: 'Outdoor Portraits Session' }
        ]
      }
    }
  });

  // 3. Nusrat Jahan (Photographer & Videographer)
  const proUser3 = await prisma.user.upsert({
    where: { email: 'nusrat@eventora.bd' },
    update: {},
    create: {
      full_name: 'Nusrat Jahan',
      email: 'nusrat@eventora.bd',
      password_hash: 'dummyhash',
      role: 'photographer',
      is_verified: true,
      phone: '01933344455',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop'
    }
  });

  await prisma.professional.upsert({
    where: { user_id: proUser3.id },
    update: {},
    create: {
      user_id: proUser3.id,
      pro_type: 'photographer_videographer',
      bio: 'Cinematographer and creative director. Specializing in high-definition video production, cinematic wedding films, drone footage, and social media reels in Chittagong.',
      city: 'Chittagong',
      country: 'Bangladesh',
      base_price: 12000,
      price_unit: 'per_day',
      years_exp: 6,
      is_approved: true,
      is_available: true,
      avg_rating: 4.7,
      review_count: 18,
      specialties: {
        create: [
          { specialty: 'Cinematic Films' },
          { specialty: 'Drone Videography' },
          { specialty: 'Wedding Reels' }
        ]
      },
      packages: {
        create: [
          {
            name: 'Reel/Short Film Package',
            description: 'Half day videography coverage, focused on producing high-energy Reels/Shorts for social media.',
            price: 12000,
            duration_hours: 4,
            inclusions: '1 Videographer, 3 Edited Reels (30-60s), Raw Video files'
          },
          {
            name: 'Cinematic Full Event Movie',
            description: 'Full day coverage with cinema-grade cameras and a drone. Delivering a 5-minute wedding film and a full length 45-minute video documentation.',
            price: 30000,
            duration_hours: 10,
            inclusions: '2 Cinematographers, Drone Footage, 5-Min Cinematic Film, 45-Min Event Highlights Movie'
          }
        ]
      },
      portfolio: {
        create: [
          { media_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', caption: 'Festival Drone Angle' },
          { media_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', caption: 'Pre-wedding Shoot B-Roll' }
        ]
      }
    }
  });

  console.log('Professionals Seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
