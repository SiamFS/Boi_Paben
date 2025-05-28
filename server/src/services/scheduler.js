import cron from 'node-cron';
import { getCollection } from '../config/database.js';

export const startScheduler = () => {
  // Run every hour to clean up old sold books from public view
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled cleanup of old sold books...');
      
      const bookCollection = getCollection('books');
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      
      // Update sold books older than 12 hours to have a flag
      const result = await bookCollection.updateMany(
        {
          availability: 'sold',
          soldAt: { $lt: twelveHoursAgo },
          hiddenFromPublic: { $ne: true }
        },
        {
          $set: { hiddenFromPublic: true }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Hidden ${result.modifiedCount} old sold books from public view`);
      }
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  });
  
  console.log('Book cleanup scheduler started');
};
