const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

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
    const reactionCollection = client.db("coverbook").collection("reactions");

    app.post('/create-checkout-session', async (req, res) => {
      const { items, email } = req.body;
    
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: items.map(item => ({
            price_data: {
              currency: 'bdt',
              product_data: {
                name: item.bookTitle,
                images: [item.imageURL],
              },
              unit_amount: Math.round(item.Price * 100),
            },
            quantity: 1,
          })),
          mode: 'payment',
          success_url: `${BASE_URL}/payment-success`, // Redirect user here after success
          cancel_url: `${BASE_URL}/add-to-payment`,
          metadata: {
            customerEmail: email,
            cartItems: JSON.stringify(items),
          },
        });
    
        // Immediately process payment success logic
        const cartItems = JSON.parse(session.metadata.cartItems);
    
        for (const item of cartItems) {
          try {
            // Update book availability
            await bookCollection.updateOne(
              { _id: new ObjectId(item.original_id) },
              { $set: { availability: 'sold' } }
            );
    
            // Remove from cart
            await cartCollection.deleteOne({
              _id: new ObjectId(item._id),
            });
          } catch (error) {
            console.error(`Error processing item ${item._id}:`, error);
          }
        }
    
        // Save payment information
        const paymentInfo = {
          email: session.metadata.customerEmail,
          amount: session.amount_total / 100,
          items: cartItems.map(item => ({
            bookId: item.original_id,
            bookTitle: item.bookTitle,
          })),
          paymentDate: new Date(),
          paymentMethod: 'card',
        };
    
        await paymentCollection.insertOne(paymentInfo);
    
        res.json({ id: session.id, success: true }); // Inform the frontend of session creation
      } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
      

// Cash on Delivery handler
app.post('/cash-on-delivery', async (req, res) => {
  const { items, email, address, totalAmount } = req.body;

  try {
    // Get original book IDs from cart items
    const cartItems = await cartCollection.find({ 
      user_email: email,
      _id: { $in: items.map(item => new ObjectId(item._id)) }
    }).toArray();

    // Update book availability and remove from cart
    for (const cartItem of cartItems) {
      try {
        // Update book availability using original_id
        const updateResult = await bookCollection.updateOne(
          { _id: new ObjectId(cartItem.original_id) },
          { $set: { availability: 'sold' } }
        );
        console.log(`Updated book ${cartItem.original_id}: ${updateResult.modifiedCount} document(s) modified`);

        // Remove from cart
        const deleteResult = await cartCollection.deleteOne({ _id: cartItem._id });
        console.log(`Removed from cart: ${deleteResult.deletedCount} document(s) deleted`);
      } catch (error) {
        console.error(`Error processing cart item ${cartItem._id}:`, error);
      }
    }

    // Save payment information
    const paymentInfo = {
      email: email,
      amount: totalAmount,
      items: cartItems.map(item => ({
        bookId: item.original_id,
        bookTitle: item.bookTitle
      })),
      address: address,
      paymentDate: new Date(),
      paymentMethod: 'cash on delivery',
    };
    await paymentCollection.insertOne(paymentInfo);

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
    
        app.post('/posts/:id/like', async (req, res) => {
          try {
            const postId = req.params.id;
            const filter = { _id: new ObjectId(postId) };
            const updateDoc = { $inc: { likes: 1 } };
            await blogCollection.updateOne(filter, updateDoc);
            res.status(200).send({ message: 'Post liked' });
          } catch (error) {
            console.error('Error liking post:', error);
            res.status(500).send({ error: 'Error liking post' });
          }
        });
    
        app.post('/posts/:id/dislike', async (req, res) => {
          try {
            const postId = req.params.id;
            const filter = { _id: new ObjectId(postId) };
            const updateDoc = { $inc: { dislikes: 1 } };
            await blogCollection.updateOne(filter, updateDoc);
            res.status(200).send({ message: 'Post disliked' });
          } catch (error) {
            console.error('Error disliking post:', error);
            res.status(500).send({ error: 'Error disliking post' });
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
              original_id: _id,  // Store the original book ID
              _id: new ObjectId() // Generate a new unique ID for the cart item
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
        // Add this to your existing Express server file
    
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

    // Handle post reaction (like/dislike)
app.post('/posts/:postId/react', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, reactionType } = req.body; // reactionType should be 'like' or 'dislike'

    // Check if user has already reacted to this post
    const existingReaction = await reactionCollection.findOne({
      postId: new ObjectId(postId),
      userId: userId
    });

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Remove reaction if clicking the same button
        await reactionCollection.deleteOne({ _id: existingReaction._id });
        
        // Update post reaction count
        const updateField = `${reactionType}s`;
        await blogCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $inc: { [updateField]: -1 } }
        );
      } else {
        // Change reaction type if clicking different button
        await reactionCollection.updateOne(
          { _id: existingReaction._id },
          { $set: { type: reactionType } }
        );
        
        // Update post reaction counts (decrease old, increase new)
        const oldField = `${existingReaction.type}s`;
        const newField = `${reactionType}s`;
        await blogCollection.updateOne(
          { _id: new ObjectId(postId) },
          { 
            $inc: { 
              [oldField]: -1,
              [newField]: 1
            } 
          }
        );
      }
    } else {
      // Create new reaction
      await reactionCollection.insertOne({
        postId: new ObjectId(postId),
        userId: userId,
        type: reactionType,
        createdAt: new Date()
      });
      
      // Update post reaction count
      const updateField = `${reactionType}s`;
      await blogCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { [updateField]: 1 } }
      );
    }

    // Get updated post data
    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(postId) });
    
    // Get user's current reaction for this post
    const userReaction = await reactionCollection.findOne({
      postId: new ObjectId(postId),
      userId: userId
    });

    res.status(200).json({
      post: updatedPost,
      userReaction: userReaction ? userReaction.type : null
    });
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ error: 'Error handling reaction' });
  }
});

// Get user's reactions for multiple posts
app.get('/posts/reactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userReactions = await reactionCollection
      .find({ userId: userId })
      .toArray();
    
    res.status(200).json(userReactions);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ error: 'Error fetching reactions' });
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
