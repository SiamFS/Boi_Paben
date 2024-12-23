const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 1526;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB configuration
const uri = "mongodb+srv://coverbook:fHZUDi0wOvuFjmLd@cluster0.1sfia34.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const stripe = require('stripe')('sk_test_51PiZwnGRR4keZPjY1AvOeX0MO8nurmyOYSuhf77UlCSGc0hxgBEHKeP1f57QaZamaMwDGjJhaMnoW2zGYDGdwV1l00TwOuTvnv');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
// Main function to run the server
async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("coverbook").collection("books");
    const cartCollection = client.db("coverbook").collection("carts");
    const paymentCollection = client.db("coverbook").collection("payments");
    const reportCollection = client.db("coverbook").collection("reports");
    const blogCollection = client.db("coverbook").collection("blogs");

    
    

    
    // Book routes
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      try {
        const result = await bookCollection.insertOne(data);
        res.status(200).json({
          message: 'Book uploaded successfully',
          result: result
        });
      } catch (error) {
        res.status(500).json({
          message: 'Failed to upload book',
          error: error.message
        });
      }
    });

    app.get("/book/email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      try {
        const result = await bookCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...updatedBookData
        }
      };
      const result = await bookCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(filter);
      if (result.deletedCount === 1) {
        res.status(200).json({ success: true, message: 'Book Deleted Successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Delete Failed' });
      }
    });

    app.get("/allbooks/", async (req, res) => {
      try {
        let query = {};
        if (req.query?.category) {
          query = { category: req.query.category };
        }
    
        let sortOptions = {};
        if (req.query?.sort) {
          sortOptions[req.query.sort] = req.query.order === 'desc' ? -1 : 1;
        } else {
          // Default sort by createdAt in descending order
          sortOptions = { createdAt: -1 };
        }
    
        const limit = parseInt(req.query?.limit) || 0;
    
        const result = await bookCollection.find(query)
          .sort(sortOptions)
          .limit(limit)
          .toArray();
    
        res.send(result);
      } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send({ error: 'An error occurred while fetching books' });
      }
    });

    app.get("/search/:title", async (req, res) => {
      const title = req.params.title;
      const query = { bookTitle: { $regex: title, $options: 'i' } };
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const filter = { _id: new ObjectId(id) };
        const result = await bookCollection.findOne(filter);
        if (!result) {
          res.status(404).send({ message: 'Book not found' });
          return;
        }
        res.send(result);
      } catch (error) {
        res.status(400).send({ message: 'Invalid ID format' });
      }
    });

    app.get("/books/sort/price", async (req, res) => {
      const { order } = req.query;
      const sortOrder = order === 'desc' ? -1 : 1;
      const result = await bookCollection.find().sort({ Price: sortOrder }).toArray();
      res.send(result);
    });

    app.get("/books/category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category };
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    });

    // Cart routes
    app.get('/cart/count/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const count = await cartCollection.countDocuments({ user_email: email });
        res.json({ count });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/cart', async (req, res) => {
      const { user_email, _id, ...rest } = req.body;

      try {
        const existingItem = await cartCollection.findOne({ user_email, original_id: _id });

        if (existingItem) {
          return res.status(400).send({ success: false, message: 'This book is already in your cart' });
        }

        const cartItem = {
          ...rest,
          user_email,
          original_id: _id,  
          _id: new ObjectId() 
        };

        const result = await cartCollection.insertOne(cartItem);
        const insertedItem = await cartCollection.findOne({ _id: result.insertedId });

        res.status(201).send({ success: true, data: insertedItem });
      } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send({ success: false, error: error.message });
      }
    });

    app.get('/cart/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const result = await cartCollection.find({ user_email: email }).toArray();
        res.send(result);
      } catch (error) {
        res.send({ success: false, error });
      }
    });

    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.status(200).send({ success: true, message: 'Item removed from cart' });
        } else {
          res.status(404).send({ success: false, message: 'Item not found' });
        }
      } catch (error) {
        res.status(500).send({ success: false, error: error.message });
      }
    });
      // Cart routes
      app.post('/cart/count', async (req, res) => {
        const { email } = req.body;
  
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
  
        try {
          const count = await cartCollection.countDocuments({ user_email: email });
          res.json({ count });
        } catch (error) {
          console.error('Error fetching cart count:', error);
          res.status(500).json({ error: 'Error fetching cart count' });
        }
      });
    // Payment routes
    app.post('/payments', async (req, res) => {
      const paymentData = req.body;
      try {
        const result = await paymentCollection.insertOne(paymentData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Error processing payment' });
      }
    });

    app.get('/payments/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const result = await paymentCollection.find({ email }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Error fetching payments' });
      }
    });



        // Create checkout session for Stripe payment
        app.post('/create-checkout-session', async (req, res) => {
          const { items, email } = req.body;
        
          try {
            
            const cartItems = await cartCollection.find({ user_email: email }).toArray();
            const originalBookIds = cartItems.map(item => item.original_id);
        
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: items.map(item => ({
                price_data: {
                  currency: 'bdt',
                  product_data: {
                    name: item.bookTitle,
                    images: [item.imageURL],
                  },
                 
                  unit_amount: Math.round(parseFloat(item.Price) * 100),
                },
                quantity: 1,
              })),
              mode: 'payment',
              success_url: `${BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${BASE_URL}/add_to_payment`,
              metadata: {
                originalBookIds: JSON.stringify(originalBookIds),
                customerEmail: email,
              },
              shipping_address_collection: {
                allowed_countries: ['BD'],
              },
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 5000, // 50 BDT in paisa
                      currency: 'bdt',
                    },
                    display_name: 'Standard shipping within Bangladesh',
                    delivery_estimate: {
                      minimum: {
                        unit: 'business_day',
                        value: 3,
                      },
                      maximum: {
                        unit: 'business_day',
                        value: 7,
                      },
                    },
                  },
                },
              ],
            });
        
            res.json({ id: session.id });
          } catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({ success: false, error: error.message });
          }
        });
        
      
        // Cash on Delivery endpoint
        app.post('/cash-on-delivery', async (req, res) => {
          const { items, email, address, totalAmount } = req.body;
        
          try {
            // Save payment information
            const paymentInfo = {
              email: email,
              amount: totalAmount,
              items: items.map(item => ({
                bookId: item._id,
                bookTitle: item.bookTitle,
              })),
              address: address,
              paymentDate: new Date(),
              paymentMethod: 'cash on delivery',
            };
            const result = await paymentCollection.insertOne(paymentInfo);
        
            // Update book availability and remove from cart
            for (const item of items) {
              const updateResult = await bookCollection.updateOne(
                { _id: new ObjectId(item._id) },
                { $set: { availability: 'sold' } }
              );
              console.log(`Updated book ${item._id}: ${updateResult.modifiedCount} document(s) modified`);
              
              const deleteResult = await cartCollection.deleteOne({ original_id: item._id, user_email: email });
              console.log(`Removed from cart: ${deleteResult.deletedCount} document(s) deleted`);
            }
        
            res.status(200).json({ success: true, message: 'Order placed successfully' });
          } catch (error) {
            console.error('Error processing cash on delivery:', error);
            res.status(500).json({ success: false, error: error.message });
          }
        });
    
        // Create a new post
        app.post('/posts/create', async (req, res) => {
          try {
            const newPost = req.body;
            const result = await blogCollection.insertOne(newPost);
            if (result.insertedId) {
              const insertedPost = await blogCollection.findOne({ _id: result.insertedId });
              res.status(201).send(insertedPost);
            } else {
              res.status(500).send({ error: 'Failed to create post' });
            }
          } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).send({ error: 'Error creating post' });
          }
        });
    
        // Get all posts
        app.get('/posts', async (req, res) => {
          try {
            const posts = await blogCollection.find({}).toArray();
            res.status(200).send(posts);
          } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).send({ error: 'Error fetching posts' });
          }
        });
    
        // Add a comment to a post
        app.post('/posts/:id/comments', async (req, res) => {
          try {
            const postId = req.params.id;
            const newComment = {
              _id: new ObjectId(),
              ...req.body,
              createdAt: new Date()
            };
            const filter = { _id: new ObjectId(postId) };
            const updateDoc = { $push: { comments: newComment } };
            const result = await blogCollection.updateOne(filter, updateDoc);
            if (result.modifiedCount === 1) {
              const updatedPost = await blogCollection.findOne(filter);
              res.status(201).send(updatedPost);
            } else {
              res.status(500).send({ error: 'Failed to add comment' });
            }
          } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).send({ error: 'Error adding comment' });
          }
        });
    
        // Update a comment
        app.put('/posts/:postId/comments/:commentId', async (req, res) => {
          try {
            const { postId, commentId } = req.params;
            const { content } = req.body;
            const filter = { _id: new ObjectId(postId) };
            const update = {
              $set: {
                "comments.$[elem].content": content,
                "comments.$[elem].edited": true
              }
            };
            const options = {
              arrayFilters: [{ "elem._id": new ObjectId(commentId) }]
            };
            const result = await blogCollection.updateOne(filter, update, options);
            if (result.modifiedCount === 1) {
              const updatedPost = await blogCollection.findOne(filter);
              res.status(200).send(updatedPost);
            } else {
              res.status(404).send({ error: 'Comment not found or not updated' });
            }
          } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).send({ error: 'Error updating comment' });
          }
        });
    
        // Delete a comment
        app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
          try {
            const { postId, commentId } = req.params;
            const filter = { _id: new ObjectId(postId) };
            const update = {
              $pull: { comments: { _id: new ObjectId(commentId) } }
            };
            const result = await blogCollection.updateOne(filter, update);
            if (result.modifiedCount === 1) {
              const updatedPost = await blogCollection.findOne(filter);
              res.status(200).send(updatedPost);
            } else {
              res.status(404).send({ error: 'Comment not found or not deleted' });
            }
          } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).send({ error: 'Error deleting comment' });
          }
        });
    
        app.put('/posts/:id', async (req, res) => {
          try {
            const postId = req.params.id;
            const updatedPost = req.body;
            const filter = { _id: new ObjectId(postId) };
            const updateDoc = { $set: updatedPost };
            const result = await blogCollection.updateOne(filter, updateDoc);
            if (result.modifiedCount === 1) {
              const updated = await blogCollection.findOne(filter);
              res.status(200).send(updated);
            } else {
              res.status(404).send({ error: 'Post not found or not updated' });
            }
          } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).send({ error: 'Error updating post' });
          }
        });
        app.delete('/posts/:id', async (req, res) => {
          try {
            const postId = req.params.id;
            const filter = { _id: new ObjectId(postId) };
            const result = await blogCollection.deleteOne(filter);
            if (result.deletedCount === 1) {
              res.status(200).send({ message: 'Post deleted successfully' });
            } else {
              res.status(404).send({ error: 'Post not found' });
            }
          } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).send({ error: 'Error deleting post' });
          }
        });
        app.post('/report', async (req, res) => {
          const reportData = req.body;
          
          try {
            // Check if this user has already reported this book
            const existingReport = await reportCollection.findOne({
              bookId: reportData.bookId,
              reporterEmail: reportData.reporterEmail
            });
        
            if (existingReport) {
              return res.status(400).json({ success: false, message: 'Already reported' });
            }
        
            // If not, insert the new report
            const result = await reportCollection.insertOne(reportData);
            
            if (result.insertedId) {
              res.status(201).json({ success: true, message: 'Report submitted successfully' });
            } else {
              res.status(500).json({ success: false, message: 'Failed to submit report' });
            }
          } catch (error) {
            console.error('Error submitting report:', error);
            res.status(500).json({ success: false, message: 'An error occurred while submitting the report' });
          }
        });

    // Health check endpoint
    app.get('/', (req, res) => {
      res.send('Hello from the Book Inventory API!');
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

run().catch(console.dir);
