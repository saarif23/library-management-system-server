const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

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
        app.get('/books', async (req, res) => {
            const cursor = booksCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
      } catch (error) {
        console.log(error)
      }






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