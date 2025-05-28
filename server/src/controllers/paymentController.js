import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { getCollection, getClient } from '../config/database.js';

// Initialize Stripe with error handling
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const paymentController = {
  async createCheckoutSession(req, res) {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No items provided' 
      });
    }

    const cartCollection = getCollection('carts');
    const bookCollection = getCollection('books');

    const cartItems = await cartCollection
      .find({
        user_email: req.user.email,
        _id: { $in: items.map(item => new ObjectId(item._id)) }
      })
      .toArray();

    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid cart items found' 
      });
    }

    for (const item of cartItems) {
      const book = await bookCollection.findOne({ 
        _id: new ObjectId(item.original_id) 
      });
      
      if (!book || book.availability === 'sold') {
        return res.status(400).json({ 
          success: false, 
          error: `Book "${item.bookTitle}" is no longer available` 
        });
      }
    }    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'bdt',
            product_data: {
              name: item.bookTitle,
              description: `By ${item.authorName}`,
              images: [item.imageURL],
            },
            unit_amount: Math.round(parseFloat(item.Price) * 100),
          },
          quantity: 1,
        })),
        mode: 'payment',        success_url: `${process.env.CLIENT_URL_LOCAL || process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_method=stripe`,
        cancel_url: `${process.env.CLIENT_URL_LOCAL || process.env.CLIENT_URL || 'http://localhost:5173'}/cart`,
        metadata: {
          userId: req.user.uid,
          userEmail: req.user.email,
          cartItemIds: JSON.stringify(cartItems.map(item => item._id.toString())),
          bookIds: JSON.stringify(cartItems.map(item => item.original_id))
        },
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 5000,
              currency: 'bdt',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        }],
      });

      res.json({ 
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create checkout session' 
      });
    }
  },

  async processCashOnDelivery(req, res) {
    const { items, address } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No items provided' 
      });
    }

    if (!address || !address.streetAddress || !address.cityTown || 
        !address.district || !address.contactNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Complete address is required' 
      });
    }

    const cartCollection = getCollection('carts');
    const bookCollection = getCollection('books');
    const paymentCollection = getCollection('payments');

    const cartItems = await cartCollection
      .find({
        user_email: req.user.email,
        _id: { $in: items.map(item => new ObjectId(item._id)) }
      })
      .toArray();

    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid cart items found' 
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const book = await bookCollection.findOne({ 
        _id: new ObjectId(item.original_id) 
      });
      
      if (!book || book.availability === 'sold') {
        return res.status(400).json({ 
          success: false, 
          error: `Book "${item.bookTitle}" is no longer available` 
        });
      }

      totalAmount += parseFloat(item.Price);
      orderItems.push({
        bookId: item.original_id,
        bookTitle: item.bookTitle,
        authorName: item.authorName,
        price: parseFloat(item.Price)
      });
    }    // Add shipping cost
    totalAmount += 50;

    const client = getClient();
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Mark books as sold
        for (const item of cartItems) {
          await bookCollection.updateOne(
            { _id: new ObjectId(item.original_id) },
            { 
              $set: { 
                availability: 'sold',
                soldAt: new Date()
              } 
            },
            { session }
          );
        }

        // Clear cart items
        await cartCollection.deleteMany(
          {
            user_email: req.user.email,
            _id: { $in: cartItems.map(item => item._id) }
          },
          { session }
        );

        // Create payment record
        const paymentInfo = {
          userId: req.user.uid,
          email: req.user.email,
          amount: totalAmount,
          items: orderItems,
          address,
          paymentMethod: 'cash_on_delivery',
          status: 'pending',
          createdAt: new Date(),
          orderId: `COD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };

        await paymentCollection.insertOne(paymentInfo, { session });
      });

      res.json({ 
        success: true, 
        message: 'Order placed successfully',
        orderId: `COD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      });
    } catch (error) {
      console.error('COD processing error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process order' 
      });
    } finally {
      await session.endSession();
    }
  },  // Webhook removed - using success URL handling instead

  async completeStripePayment(req, res) {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required' 
      });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ 
          success: false, 
          error: 'Payment not completed' 
        });
      }

      // Get cart items and book IDs from session metadata
      const cartItemIds = JSON.parse(session.metadata.cartItemIds);
      const bookIds = JSON.parse(session.metadata.bookIds);
      
      const cartCollection = getCollection('carts');
      const bookCollection = getCollection('books');
      const paymentCollection = getCollection('payments');

      // Check if payment was already processed
      const existingPayment = await paymentCollection.findOne({
        stripeSessionId: sessionId
      });

      if (existingPayment) {
        return res.json({ 
          success: true, 
          message: 'Payment already processed',
          alreadyProcessed: true
        });
      }

      const client = getClient();
      const dbSession = client.startSession();
      
      try {
        await dbSession.withTransaction(async () => {
          // Mark books as sold
          for (const bookId of bookIds) {
            await bookCollection.updateOne(
              { _id: new ObjectId(bookId) },
              { 
                $set: { 
                  availability: 'sold',
                  soldAt: new Date()
                } 
              },
              { session: dbSession }
            );
          }

          // Clear cart items
          await cartCollection.deleteMany({
            _id: { $in: cartItemIds.map(id => new ObjectId(id)) }
          }, { session: dbSession });

          // Create payment record
          const paymentInfo = {
            userId: session.metadata.userId,
            email: session.metadata.userEmail,
            amount: session.amount_total / 100,
            paymentMethod: 'stripe',
            stripeSessionId: session.id,
            status: 'completed',
            createdAt: new Date()
          };

          await paymentCollection.insertOne(paymentInfo, { session: dbSession });
        });

        res.json({ 
          success: true, 
          message: 'Payment completed successfully' 
        });
      } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to complete payment' 
        });
      } finally {
        await dbSession.endSession();
      }
    } catch (error) {
      console.error('Stripe payment completion error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to verify payment' 
      });
    }
  },

  async getPaymentHistory(req, res) {
    const paymentCollection = getCollection('payments');
    
    const payments = await paymentCollection
      .find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(payments);
  }
};