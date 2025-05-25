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
  }
};