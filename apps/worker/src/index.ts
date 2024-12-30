import { redis, initializeRedis } from './lib/redis';
import prisma from './db';


async function processEvents() {
  while (true) {
    try {
      const eventString = await redis.blPop('document_events', 0); // Blocking pop
      if (eventString && Array.isArray(eventString)) {
        const [, event] = eventString; // BLPOP returns [queueName, value]
        const parsedEvent = JSON.parse(event);
        await prisma.event.create({ data: parsedEvent });
        console.log('Processed event:', parsedEvent);
      }
    } catch (err) {
      console.error('Error processing event:', err);
    }
  }
}

async function processSaveEvents() {
  while (true) {
    try {
      const saveEventString = await redis.blPop('document_save_events', 0);
      if (saveEventString && Array.isArray(saveEventString)) {
        const [, saveEvent] = saveEventString;
        const parsedSaveEvent = JSON.parse(saveEvent);
        await prisma.version.create({ data: parsedSaveEvent });
        console.log('Processed save event:', parsedSaveEvent);
      }
    } catch (err) {
      console.error('Error processing save event:', err);
    }
  }
}

async function startWorker() {
  await initializeRedis();
  processEvents();
  processSaveEvents();
}

startWorker().catch((err) => console.error('Worker initialization error:', err));
