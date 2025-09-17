import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
    },
  })

  const user4 = await prisma.user.upsert({
    where: { email: 'diana@example.com' },
    update: {},
    create: {
      email: 'diana@example.com',
      name: 'Diana Prince',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Tournament Owner',
    },
  })

  // Create sample event
  const event = await prisma.event.upsert({
    where: { id: 'sample-tournament' },
    update: {},
    create: {
      id: 'sample-tournament',
      title: 'Sample Tournament Bracket',
      description: 'A demonstration tournament for bracket resolution system',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
      location: 'Demo Arena',
      maxParticipants: 4,
      ownerId: owner.id,
      applicationOpen: false,
    },
  })

  // Create participants
  const participants = await Promise.all([
    prisma.participant.upsert({
      where: { userId_eventId: { userId: user1.id, eventId: event.id } },
      update: {},
      create: {
        userId: user1.id,
        eventId: event.id,
        status: 'APPROVED',
      },
    }),
    prisma.participant.upsert({
      where: { userId_eventId: { userId: user2.id, eventId: event.id } },
      update: {},
      create: {
        userId: user2.id,
        eventId: event.id,
        status: 'APPROVED',
      },
    }),
    prisma.participant.upsert({
      where: { userId_eventId: { userId: user3.id, eventId: event.id } },
      update: {},
      create: {
        userId: user3.id,
        eventId: event.id,
        status: 'APPROVED',
      },
    }),
    prisma.participant.upsert({
      where: { userId_eventId: { userId: user4.id, eventId: event.id } },
      update: {},
      create: {
        userId: user4.id,
        eventId: event.id,
        status: 'APPROVED',
      },
    }),
  ])

  // Create sample matches for a 4-person tournament
  const match1 = await prisma.match.upsert({
    where: { id: 'match-1' },
    update: {},
    create: {
      id: 'match-1',
      eventId: event.id,
      roundNumber: 1,
      matchNumber: 1,
      participant1Id: participants[0].id,
      participant2Id: participants[1].id,
      status: 'IN_PROGRESS',
    },
  })

  const match2 = await prisma.match.upsert({
    where: { id: 'match-2' },
    update: {},
    create: {
      id: 'match-2',
      eventId: event.id,
      roundNumber: 1,
      matchNumber: 2,
      participant1Id: participants[2].id,
      participant2Id: participants[3].id,
      status: 'DISPUTED',
    },
  })

  // Final match
  const finalMatch = await prisma.match.upsert({
    where: { id: 'final-match' },
    update: {},
    create: {
      id: 'final-match',
      eventId: event.id,
      roundNumber: 2,
      matchNumber: 1,
      status: 'PENDING',
    },
  })

  // Add some sample score entries that don't match (causing dispute)
  await prisma.scoreEntry.upsert({
    where: { id: 'score-1' },
    update: {},
    create: {
      id: 'score-1',
      matchId: match2.id,
      participantId: participants[2].id,
      participant1Score: 10,
      participant2Score: 8,
    },
  })

  await prisma.scoreEntry.upsert({
    where: { id: 'score-2' },
    update: {},
    create: {
      id: 'score-2',
      matchId: match2.id,
      participantId: participants[3].id,
      participant1Score: 8,
      participant2Score: 10,
    },
  })

  // Add a dispute for the conflicting scores
  await prisma.dispute.upsert({
    where: { id: 'dispute-1' },
    update: {},
    create: {
      id: 'dispute-1',
      matchId: match2.id,
      reason: 'Players submitted different scores',
      status: 'PENDING',
    },
  })

  console.log('Seed data created successfully!')
  console.log('Sample tournament ID:', event.id)
  console.log('Tournament owner email:', owner.email)
  console.log('Player emails:', [user1.email, user2.email, user3.email, user4.email])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })