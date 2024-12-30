import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupEventsAndSnapshots() {
  try {
    console.log(`[${new Date().toISOString()}] Starting cleanup job...`);

    const eventCleanupThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    const snapshotCleanupThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const deletedEvents = await prisma.event.deleteMany({
      where: {
        createdAt: {
          lt: eventCleanupThreshold,
        },
      },
    });
    console.log(`Deleted ${deletedEvents.count} events older than 10 minutes.`);

    const deletedSnapshots = await prisma.version.deleteMany({
      where: {
        createdAt: {
          lt: snapshotCleanupThreshold,
        },
      },
    });
    console.log(`Deleted ${deletedSnapshots.count} snapshots older than 7 days.`);

    console.log(`[${new Date().toISOString()}] Cleanup job completed.`);
  } catch (error) {
    console.error('Error during cleanup job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupEventsAndSnapshots().catch((error) => console.error('Cleanup job failed:', error));
