import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

export const cartController = {
  async getCartCount(req, res) {
    const cartCollection = getCollection('carts');
    const count = await cartCollection.countDocuments({ 
      user_email: req.user.email 
    });
    
    res.json({ count });
  },

  async getCartItems(req, res) {
    const cartCollection = getCollection('carts');
    const bookCollection = getCollection('books');
    
    const cartItems = await cartCollection
      .find({ user_email: req.user.email })
      .toArray();

    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        const book = await bookCollection.findOne({ 
          _id: new ObjectId(item.original_id) 
        });
        return {
          ...item,
          availability: book?.availability || 'unknown'
        };
      })
    );

    res.json(enrichedItems);
  },

  async addToCart(req, res) {
    const { bookId, bookTitle, authorName, imageURL, Price, category } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Book ID is required' 
      });
    }

    const cartCollection = getCollection('carts');
    const bookCollection = getCollection('books');

    const book = await bookCollection.findOne({ 
      _id: new ObjectId(bookId) 
    });

    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    if (book.availability === 'sold') {
      return res.status(400).json({ 
        success: false, 
        error: 'This book is already sold' 
      });
    }

    const existingItem = await cartCollection.findOne({ 
      user_email: req.user.email,
      original_id: bookId 
    });

    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        error: 'This book is already in your cart' 
      });
    }

    const cartItem = {
      bookTitle: bookTitle || book.bookTitle,
      authorName: authorName || book.authorName,
      imageURL: imageURL || book.imageURL,
      Price: Price || book.Price,
      category: category || book.category,
      user_email: req.user.email,
      original_id: bookId,
      addedAt: new Date()
    };

    const result = await cartCollection.insertOne(cartItem);
    const insertedItem = await cartCollection.findOne({ 
      _id: result.insertedId 
    });

    res.status(201).json({ 
      success: true, 
      data: insertedItem,
      message: 'Book added to cart successfully'
    });
  },

  async removeFromCart(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid cart item ID' 
      });
    }

    const cartCollection = getCollection('carts');
    
    const item = await cartCollection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }

    if (item.user_email !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to remove this item' 
      });
    }

    const result = await cartCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to remove item from cart' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item removed from cart' 
    });
  },

  async clearCart(req, res) {
    const cartCollection = getCollection('carts');
    
    const result = await cartCollection.deleteMany({ 
      user_email: req.user.email 
    });

    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} items from cart` 
    });
  }
};