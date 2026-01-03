import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'demo@globetrotter.com' },
        update: {},
        create: {
            email: 'demo@globetrotter.com',
            password: hashedPassword,
            name: 'Demo User',
            savedDestinations: [],
        },
    });

    console.log('✅ Created demo user:', user.email);

    // Create cities
    const cities = await Promise.all([
        prisma.city.upsert({
            where: { name_country: { name: 'Paris', country: 'France' } },
            update: {},
            create: {
                name: 'Paris',
                country: 'France',
                region: 'Europe',
                description: 'The City of Light, famous for its cafe culture, Eiffel Tower, and the Louvre.',
                imageUrl: '/images/cities/paris.jpg',
                costIndex: 75,
                popularity: 95,
                latitude: 48.8566,
                longitude: 2.3522,
                attractions: {
                    create: [
                        { name: 'Eiffel Tower', type: 'sightseeing', cost: 30, duration: 180, description: 'Iconic iron lady of Paris.' },
                        { name: 'Louvre Museum', type: 'sightseeing', cost: 20, duration: 240, description: 'World\'s largest art museum.' },
                        { name: 'Seine Cruise', type: 'activity', cost: 15, duration: 60, description: 'Relaxing boat ride.' },
                        { name: 'Montmartre Walk', type: 'sightseeing', cost: 0, duration: 120, description: 'Artist quarter with views.' }
                    ]
                }
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'Tokyo', country: 'Japan' } },
            update: {},
            create: {
                name: 'Tokyo',
                country: 'Japan',
                region: 'Asia',
                description: 'A bustling metropolis mixing ultra-modern neon aesthetics with traditional temples.',
                imageUrl: '/images/cities/tokyo.jpg',
                costIndex: 70,
                popularity: 90,
                latitude: 35.6762,
                longitude: 139.6503,
                attractions: {
                    create: [
                        { name: 'Senso-ji Temple', type: 'sightseeing', cost: 0, duration: 60, description: 'Ancient Buddhist temple.' },
                        { name: 'Shibuya Crossing', type: 'sightseeing', cost: 0, duration: 30, description: 'Busiest intersection.' },
                        { name: 'TeamLab Planets', type: 'entertainment', cost: 30, duration: 90, description: 'Digital art museum.' }
                    ]
                }
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'New York', country: 'USA' } },
            update: {},
            create: {
                name: 'New York',
                country: 'USA',
                region: 'North America',
                description: 'The Big Apple, known for Times Square, Central Park, and Broadway.',
                imageUrl: '/images/cities/newyork.jpg',
                costIndex: 85,
                popularity: 92,
                latitude: 40.7128,
                longitude: -74.0060,
                attractions: {
                    create: [
                        { name: 'Statue of Liberty', type: 'sightseeing', cost: 25, duration: 180, description: 'Symbol of freedom.' },
                        { name: 'Central Park', type: 'relaxation', cost: 0, duration: 120, description: 'Urban park oasis.' },
                        { name: 'Broadway Show', type: 'entertainment', cost: 100, duration: 180, description: 'World-class theater.' }
                    ]
                }
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'Barcelona', country: 'Spain' } },
            update: {},
            create: {
                name: 'Barcelona',
                country: 'Spain',
                region: 'Europe',
                description: 'Mediterranean paradise with stunning architecture',
                imageUrl: '/images/cities/barcelona.jpg',
                costIndex: 65,
                popularity: 88,
                latitude: 41.3851,
                longitude: 2.1734,
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'Bali', country: 'Indonesia' } },
            update: {},
            create: {
                name: 'Bali',
                country: 'Indonesia',
                region: 'Asia',
                description: 'Tropical paradise with beaches, temples, and rice terraces',
                imageUrl: '/images/cities/bali.jpg',
                costIndex: 40,
                popularity: 85,
                latitude: -8.3405,
                longitude: 115.0920,
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'Dubai', country: 'UAE' } },
            update: {},
            create: {
                name: 'Dubai',
                country: 'UAE',
                region: 'Middle East',
                description: 'Luxurious desert oasis with modern marvels',
                imageUrl: '/images/cities/dubai.jpg',
                costIndex: 80,
                popularity: 87,
                latitude: 25.2048,
                longitude: 55.2708,
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'London', country: 'UK' } },
            update: {},
            create: {
                name: 'London',
                country: 'UK',
                region: 'Europe',
                description: 'Historic capital with royal palaces and museums',
                imageUrl: '/images/cities/london.jpg',
                costIndex: 82,
                popularity: 93,
                latitude: 51.5074,
                longitude: -0.1278,
            },
        }),
        prisma.city.upsert({
            where: { name_country: { name: 'Rome', country: 'Italy' } },
            update: {},
            create: {
                name: 'Rome',
                country: 'Italy',
                region: 'Europe',
                description: 'The Eternal City with ancient ruins and Renaissance art',
                imageUrl: '/images/cities/rome.jpg',
                costIndex: 68,
                popularity: 91,
                latitude: 41.9028,
                longitude: 12.4964,
            },
        }),
    ]);

    console.log(`✅ Created ${cities.length} cities`);

    // Create a sample trip
    const trip = await prisma.trip.create({
        data: {
            name: 'European Adventure 2026',
            description: 'A month-long journey through historic European cities',
            startDate: new Date('2026-06-01'),
            endDate: new Date('2026-06-28'),
            status: 'upcoming',
            userId: user.id,
            coverImage: '/images/trips/europe.jpg',
            stops: {
                create: [
                    {
                        cityId: cities[0].id, // Paris
                        startDate: new Date('2026-06-01'),
                        endDate: new Date('2026-06-07'),
                        order: 1,
                        notes: 'Explore the Louvre and Eiffel Tower',
                        activities: {
                            create: [
                                {
                                    name: 'Eiffel Tower Visit',
                                    description: 'Iconic landmark with stunning city views',
                                    type: 'sightseeing',
                                    cost: 25,
                                    duration: 120,
                                    date: new Date('2026-06-02'),
                                    time: '10:00',
                                    imageUrl: '/images/activities/eiffel.jpg',
                                },
                                {
                                    name: 'Louvre Museum',
                                    description: 'World-famous art museum',
                                    type: 'sightseeing',
                                    cost: 17,
                                    duration: 240,
                                    date: new Date('2026-06-03'),
                                    time: '09:00',
                                    imageUrl: '/images/activities/louvre.jpg',
                                },
                            ],
                        },
                    },
                    {
                        cityId: cities[3].id, // Barcelona
                        startDate: new Date('2026-06-08'),
                        endDate: new Date('2026-06-14'),
                        order: 2,
                        notes: 'Gaudi architecture and beach time',
                        activities: {
                            create: [
                                {
                                    name: 'Sagrada Familia',
                                    description: 'Gaudi\'s masterpiece basilica',
                                    type: 'sightseeing',
                                    cost: 26,
                                    duration: 150,
                                    date: new Date('2026-06-09'),
                                    time: '11:00',
                                },
                                {
                                    name: 'Beach Day at Barceloneta',
                                    description: 'Relax on the Mediterranean coast',
                                    type: 'relaxation',
                                    cost: 0,
                                    duration: 360,
                                    date: new Date('2026-06-11'),
                                    time: '10:00',
                                },
                            ],
                        },
                    },
                    {
                        cityId: cities[7].id, // Rome
                        startDate: new Date('2026-06-15'),
                        endDate: new Date('2026-06-21'),
                        order: 3,
                        notes: 'Ancient history and Italian cuisine',
                        activities: {
                            create: [
                                {
                                    name: 'Colosseum Tour',
                                    description: 'Ancient Roman amphitheater',
                                    type: 'sightseeing',
                                    cost: 30,
                                    duration: 180,
                                    date: new Date('2026-06-16'),
                                    time: '09:00',
                                },
                                {
                                    name: 'Vatican Museums',
                                    description: 'Art collections and Sistine Chapel',
                                    type: 'sightseeing',
                                    cost: 35,
                                    duration: 240,
                                    date: new Date('2026-06-18'),
                                    time: '08:00',
                                },
                            ],
                        },
                    },
                ],
            },
            expenses: {
                create: [
                    {
                        category: 'transport',
                        amount: 450,
                        currency: 'USD',
                        description: 'Flight tickets',
                        date: new Date('2026-05-15'),
                    },
                    {
                        category: 'accommodation',
                        amount: 1200,
                        currency: 'USD',
                        description: 'Hotel bookings for 3 cities',
                        date: new Date('2026-05-20'),
                    },
                ],
            },
        },
    });

    console.log('✅ Created sample trip:', trip.name);

    // Create user preferences
    const preferences = await prisma.userPreferences.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            language: 'en',
            currency: 'USD',
            timezone: 'America/New_York',
            privacy: 'private',
        },
    });

    console.log('✅ Created user preferences');

    console.log('\n🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
