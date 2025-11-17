import { getCollection } from './database.js';

/**
 * Initialize all database indexes for optimal performance
 * Run this once when setting up the database
 */
export const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // Books Collection Indexes
    const bookCollection = getCollection('books');
    await bookCollection.createIndex({ category: 1 });
    await bookCollection.createIndex({ availability: 1 });
    await bookCollection.createIndex({ email: 1 });
    await bookCollection.createIndex({ createdAt: -1 });
    await bookCollection.createIndex({ soldAt: 1 });
    await bookCollection.createIndex({ availability: 1, soldAt: 1 }); // Compound index
    await bookCollection.createIndex({ bookTitle: 'text', authorName: 'text' }); // Text search
    console.log('✓ Books collection indexes created');

    // Carts Collection Indexes
    const cartCollection = getCollection('carts');
    await cartCollection.createIndex({ user_email: 1 });
    await cartCollection.createIndex({ original_id: 1 });
    await cartCollection.createIndex({ user_email: 1, original_id: 1 }); // Compound index
    await cartCollection.createIndex({ addedAt: 1 });
    console.log('✓ Carts collection indexes created');

    // Blogs Collection Indexes
    const blogCollection = getCollection('blogs');
    await blogCollection.createIndex({ authorId: 1 });
    await blogCollection.createIndex({ createdAt: -1 });
    await blogCollection.createIndex({ 'reactions.userId': 1 }); // For embedded reactions
    console.log('✓ Blogs collection indexes created');

    // Payments Collection Indexes
    const paymentCollection = getCollection('payments');
    await paymentCollection.createIndex({ user_email: 1 });
    await paymentCollection.createIndex({ sessionId: 1 });
    await paymentCollection.createIndex({ status: 1 });
    await paymentCollection.createIndex({ createdAt: -1 });
    console.log('✓ Payments collection indexes created');

    console.log('✅ All database indexes created successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

/**
 * Drop old indexes that are no longer needed
 */
export const dropOldIndexes = async () => {
  try {
    console.log('Dropping old/unused indexes...');
    
    // Add any old indexes to drop here if needed
    
    console.log('✓ Old indexes dropped');
    return { success: true };
  } catch (error) {
    console.error('Error dropping indexes:', error);
    throw error;
  }
};
