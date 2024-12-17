const express = require('express');
const app = express();
const port= 1526;
const cors = require('cors');

//configuration for frontend and backend communication
app.use(cors());
app.use(express.json());

//MongoDB configuration
const { MongoClient, ServerApiVersion, ObjectId, Db } = require('mongodb');
const e = require('express');
const uri = "mongodb+srv://coverbook:fHZUDi0wOvuFjmLd@cluster0.1sfia34.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const books_collection = client.db("coverbook").collection("books");
        app.post("/upload-book", async (req, res) => {
          const data = req.body;
          try {
            const result = await books_collection.insertOne(data);
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
            const result = await books_collection.find(query).toArray();
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
          const result = await books_collection.updateOne(filter, updateDoc, options);
          res.send(result);
        });
    
        app.delete("/book/:id", async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const result = await books_collection.deleteOne(filter);
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
        
            const result = await books_collection.find(query)
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
          const result = await books_collection.find(query).toArray();
          res.send(result);
        });
    
        app.get("/book/:id", async (req, res) => {
          const id = req.params.id;
          try {
            const filter = { _id: new ObjectId(id) };
            const result = await books_collection.findOne(filter);
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
          const result = await books_collection.find().sort({ Price: sortOrder }).toArray();
          res.send(result);
        });
    
        app.get("/books/category/:category", async (req, res) => {
          const category = req.params.category;
          const query = { category };
          const result = await books_collection.find(query).toArray();
          res.send(result);
        });
  
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });