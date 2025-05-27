import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

export const bookController = {
  async getAllBooks(req, res) {
    const { category, sort, order, limit = 0 } = req.query;
    const bookCollection = getCollection('books');
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const sortOptions = {};
    if (sort) {
      sortOptions[sort] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const books = await bookCollection
      .find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .toArray();

    res.json(books);
  },

  async getBookById(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const bookCollection = getCollection('books');
    const book = await bookCollection.findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  },

  async uploadBook(req, res) {
    const bookCollection = getCollection('books');
    const bookData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      availability: 'available'
    };

    const result = await bookCollection.insertOne(bookData);
    const newBook = await bookCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully',
      data: newBook
    });
  },

  async updateBook(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const bookCollection = getCollection('books');
    const book = await bookCollection.findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.email !== req.body.userEmail && book.email !== req.user?.email) {
      return res.status(403).json({ error: 'Unauthorized to update this book' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    delete updateData._id;
    delete updateData.userEmail;

    const result = await bookCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'No changes made' });
    }

    const updatedBook = await bookCollection.findOne({ _id: new ObjectId(id) });
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  },

  async deleteBook(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const bookCollection = getCollection('books');
    const book = await bookCollection.findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.email !== req.user?.email) {
      return res.status(403).json({ error: 'Unauthorized to delete this book' });
    }

    const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: 'Failed to delete book' });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  },

  async searchBooks(req, res) {
    const { query } = req.params;
    const bookCollection = getCollection('books');
    
    const books = await bookCollection
      .find({
        $or: [
          { bookTitle: { $regex: query, $options: 'i' } },
          { authorName: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(50)
      .toArray();

    res.json(books);
  },

  async getBooksByCategory(req, res) {
    const { category } = req.params;
    const bookCollection = getCollection('books');
    
    const books = await bookCollection
      .find({ category })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    res.json(books);
  },

  async getUserBooks(req, res) {
    const { email } = req.params;
    
    if (req.user.email !== email) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const bookCollection = getCollection('books');
    const books = await bookCollection
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(books);
  },

  async getRecommendations(req, res) {
    const { userId, limit = 10 } = req.query;
    const bookCollection = getCollection('books');
    
    try {
      let recommendedBooks = [];
      
      if (userId) {
        // Get user's reading history/preferences for personalized recommendations
        // This is a simplified version - you could implement collaborative filtering
        const userBooksCollection = getCollection('userBooks');
        const userPreferences = await userBooksCollection
          .find({ userId })
          .limit(10)
          .toArray();
        
        if (userPreferences.length > 0) {
          const categories = [...new Set(userPreferences.map(b => b.category))];
          recommendedBooks = await bookCollection
            .find({ 
              category: { $in: categories },
              status: { $ne: 'deleted' }
            })
            .sort({ rating: -1, reviewCount: -1 })
            .limit(parseInt(limit))
            .toArray();
        }
      }
      
      // If no personalized recommendations, get popular books
      if (recommendedBooks.length === 0) {
        recommendedBooks = await bookCollection
          .find({ status: { $ne: 'deleted' } })
          .sort({ rating: -1, viewCount: -1, createdAt: -1 })
          .limit(parseInt(limit))
          .toArray();
      }
      
      res.json({
        success: true,
        books: recommendedBooks
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendations'
      });
    }
  },

  async getLatestBooks(req, res) {
    const { limit = 10 } = req.query;
    const bookCollection = getCollection('books');
    
    try {
      const latestBooks = await bookCollection
        .find({ status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      res.json({
        success: true,
        books: latestBooks
      });
    } catch (error) {
      console.error('Error getting latest books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get latest books'
      });
    }
  },

  async getSimilarBooks(req, res) {
    const { id } = req.params;
    const { limit = 6 } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid book ID' 
      });
    }

    const bookCollection = getCollection('books');
    
    try {
      // Get the current book
      const currentBook = await bookCollection.findOne({ _id: new ObjectId(id) });
      
      if (!currentBook) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }
      
      // Find similar books based on category, author, or tags
      const similarBooks = await bookCollection
        .find({
          _id: { $ne: new ObjectId(id) },
          $or: [
            { category: currentBook.category },
            { author: currentBook.author },
            { tags: { $in: currentBook.tags || [] } }
          ],
          status: { $ne: 'deleted' }
        })
        .sort({ rating: -1, viewCount: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      res.json({
        success: true,
        books: similarBooks
      });
    } catch (error) {
      console.error('Error getting similar books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get similar books'
      });
    }
  },

  async getPersonalizedRecommendations(req, res) {
    const { userId, categories = [], limit = 10 } = req.body;
    const bookCollection = getCollection('books');
    
    try {
      const query = {
        status: { $ne: 'deleted' }
      };
      
      if (categories.length > 0) {
        query.category = { $in: categories };
      }
      
      const personalizedBooks = await bookCollection
        .find(query)
        .sort({ rating: -1, reviewCount: -1, viewCount: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      res.json({
        success: true,
        books: personalizedBooks
      });
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get personalized recommendations'
      });
    }
  },

  async seedSampleData(req, res) {
    const bookCollection = getCollection('books');
    
    try {
      // Check if we already have books
      const existingCount = await bookCollection.countDocuments();
      if (existingCount > 0) {
        return res.json({
          success: true,
          message: 'Sample data already exists',
          count: existingCount
        });
      }

      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          bookTitle: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          authorName: 'F. Scott Fitzgerald',
          description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
          price: 450,
          Price: 450,
          originalPrice: 600,
          category: 'Fiction',
          condition: 'Good',          imageURL: '/book1.png',
          coverImage: '/book1.png',
          rating: 4.5,
          email: 'seller1@example.com',
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'To Kill a Mockingbird',
          bookTitle: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          authorName: 'Harper Lee',
          description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
          price: 380,
          Price: 380,
          originalPrice: 500,
          category: 'Fiction',
          condition: 'Excellent',          imageURL: '/book2.png',
          coverImage: '/book2.png',
          rating: 4.8,
          email: 'seller2@example.com',
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: '1984',
          bookTitle: '1984',
          author: 'George Orwell',
          authorName: 'George Orwell',
          description: 'A dystopian social science fiction novel about totalitarian control and surveillance.',
          price: 420,
          Price: 420,
          originalPrice: 550,
          category: 'Science Fiction',
          condition: 'Good',          imageURL: '/book3.png',
          coverImage: '/book3.png',
          rating: 4.7,
          email: 'seller3@example.com',
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Pride and Prejudice',
          bookTitle: 'Pride and Prejudice',
          author: 'Jane Austen',
          authorName: 'Jane Austen',
          description: 'A romantic novel that critiques the British landed gentry at the end of the 18th century.',
          price: 350,
          Price: 350,
          originalPrice: 480,
          category: 'Romance',
          condition: 'Fair',          imageURL: '/book4.png',
          coverImage: '/book4.png',
          rating: 4.6,
          email: 'seller4@example.com',
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'The Catcher in the Rye',
          bookTitle: 'The Catcher in the Rye',
          author: 'J.D. Salinger',
          authorName: 'J.D. Salinger',
          description: 'A controversial novel about teenage rebellion and alienation in post-war America.',
          price: 400,
          Price: 400,
          originalPrice: 520,
          category: 'Fiction',
          condition: 'Good',          imageURL: '/book5.png',
          coverImage: '/book5.png',
          rating: 4.3,
          email: 'seller5@example.com',
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await bookCollection.insertMany(sampleBooks);
      
      res.json({
        success: true,
        message: 'Sample books added successfully!',
        count: result.insertedCount,
        insertedIds: result.insertedIds
      });
    } catch (error) {
      console.error('Error seeding sample data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to seed sample data'
      });
    }
  },

  async clearSampleData(req, res) {
    const bookCollection = getCollection('books');
    
    try {
      const result = await bookCollection.deleteMany({});
      
      res.json({
        success: true,
        message: 'All books cleared successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error clearing sample data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear sample data'
      });
    }
  },

  async getSearchSuggestions(req, res) {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const bookCollection = getCollection('books');
    
    try {
      if (!query || query.trim().length < 2) {
        return res.json({ success: true, suggestions: [] });
      }

      // Get unique suggestions from book titles, authors, and categories
      const titleSuggestions = await bookCollection
        .aggregate([
          {
            $match: {
              bookTitle: { $regex: query, $options: 'i' },
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$bookTitle',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: Math.floor(limit / 3) }
        ])
        .toArray();

      const authorSuggestions = await bookCollection
        .aggregate([
          {
            $match: {
              authorName: { $regex: query, $options: 'i' },
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$authorName',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: Math.floor(limit / 3) }
        ])
        .toArray();

      const categorySuggestions = await bookCollection
        .aggregate([
          {
            $match: {
              category: { $regex: query, $options: 'i' },
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: Math.floor(limit / 3) }
        ])
        .toArray();

      // Combine and format suggestions
      const suggestions = [
        ...titleSuggestions.map(item => ({
          text: item._id,
          type: 'title',
          count: item.count
        })),
        ...authorSuggestions.map(item => ({
          text: item._id,
          type: 'author',
          count: item.count
        })),
        ...categorySuggestions.map(item => ({
          text: item._id,
          type: 'category',
          count: item.count
        }))
      ]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

      res.json({
        success: true,
        suggestions
      });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get search suggestions'
      });
    }
  },

  async getCategories(req, res) {
    const bookCollection = getCollection('books');
    
    try {
      const categories = await bookCollection
        .aggregate([
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          }
        ])
        .toArray();

      const categoryList = categories.map(cat => cat._id).filter(Boolean);
      
      res.json({
        success: true,
        categories: categoryList
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get categories'
      });
    }
  }
};