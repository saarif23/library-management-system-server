const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.DB_PASS}@cluster0.jrzn18f.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const bookCategoryCollection = client.db("booksDB").collection("category")
    const booksCollection = client.db('booksDB').collection('books')
    const borrowBookCollection = client.db('booksDB').collection('borrowBooks')
    try {
      app.get('/category', async (req, res) => {
        const cursor = bookCategoryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }
    try {
      app.get('/books/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await booksCollection.findOne(query);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }

    try {
      app.get('/books', async (req, res) => {
        const cursor = booksCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
    } catch (error) {
      console.lo; g(error)
    };


    // update one book
    try {
      app.put('/books/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateBook = req.body;
        if (updateBook.totalQuantity !== undefined) {
          const quantity = updateBook.totalQuantity;
          console.log(quantity);

          const update = {
            $set: {
              quantity: quantity
            }
          };

          const result = await booksCollection.updateOne(filter, update);
          res.send(result)
        } else {
          const book = {
            $set: {
              book_name: updateBook.book_name,
              author_name: updateBook.author_name,
              book_category: updateBook.book_category,
              quantity: updateBook.quantity,
              rating: updateBook.rating,
              image: updateBook.image,
              details: updateBook.details
            }
          }
          const result = await booksCollection.updateOne(filter, book)
          res.send(result);
        }
      })

    } catch (error) {
      console.log(error);
    }


    try {
      app.post('/borrowBooks', async (req, res) => {
        const borrowBooks = req.body;
        console.log(borrowBooks);
        const result = await borrowBookCollection.insertOne(borrowBooks);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }

    try {
      app.get('/borrowBooks', async (req, res) => {
        const cursor = borrowBookCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      })
    } catch (error) {
      console.log(error)

    }

    try {
      app.get('/borrowBooks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await borrowBookCollection.findOne(query);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    };

    try {
      app.delete('/borrowBooks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await borrowBookCollection.deleteOne(query);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    };





    // Send a ping to confirm a successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})