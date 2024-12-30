import cron from 'node-cron';
import { exec } from 'child_process';

console.log('Scheduler is running.');

cron.schedule('*/10 * * * *', () => {
  console.log(`[${new Date().toISOString()}] Triggering cleanup job...`);
  exec('ts-node src/lib/cleanup.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing cleanup job: ${error.message}`);
    }
    if (stdout) {
      console.log(`Cleanup job output: ${stdout}`);
    }
    if (stderr) {
      console.error(`Cleanup job error output: ${stderr}`);
    }
  });
});
