import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.match.deleteMany();

  const matches = await prisma.match.createMany({
    data: [
      {
        opponent: 'Leeds United',
        venue: 'Home',
        date: new Date('2026-03-21'),
        competition: 'Championship',
        status: 'upcoming',
        result: '',
      },
      {
        opponent: 'Norwich City',
        venue: 'Away',
        date: new Date('2026-03-24'),
        competition: 'Championship',
        status: 'upcoming',
        result: '',
      },
      {
        opponent: 'Hull City',
        venue: 'Home',
        date: new Date('2026-03-28'),
        competition: 'Championship',
        status: 'upcoming',
        result: '',
      },
    ],
  });

  console.log('Seeded matches:', matches);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });