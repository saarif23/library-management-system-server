const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cookieParser = require('cookie-parser')

// Port
const port = process.env.PORT || 5000


// Middlewares

//cors origin 
app.use(cors({
  origin: ['http://localhost:5173',
    'http://localhost:5174',
    'https://library-management-syste-28a46.web.app',
    'library-management-syste-28a46.firebaseapp.com',
    'https://iridescent-croissant-76b1d3.netlify.app'


  ],
  credentials: true
}));



app.use(express.json())

app.get('/', (req, res) => {
  res.send('Complete it')
})
app.use(cookieParser());





// varify the access token

const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  console.log("toker", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access 401" })
  }
  jwt.verify(token, process.env.ACCESS_USER_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "unauthorized access" })
    }
    req.user = decoded;
    next();
  })
}



// user uri

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
    // collections nd db 
    const bookCategoryCollection = client.db("booksDB").collection("category")
    const booksCollection = client.db('booksDB').collection('books')
    const borrowBookCollection = client.db('booksDB').collection('borrowBooks')




    // json werb token api 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log("user in  post api ", user);
      const token = jwt.sign(user, process.env.ACCESS_USER_TOKEN, { expiresIn: "1h" })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

        })
        .send({ success: true })
    })


    // logout api
    try {
      app.post('/logout', (req, res) => {
        const user = req.body;
        console.log('delete post ', user)
        res.clearCookie('token', { maxAge: 0 },).send({ success: true })
      })
    } catch (error) {
      console.log(error);
    }






    // category api
    try {
      app.get('/category', async (req, res) => {
        const cursor = bookCategoryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }


    // get all boooks
    try {
      app.get('/books', verifyToken, async (req, res) => {
        const cursor = booksCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    };



    //get one book
    try {
      app.get('/books/:id', verifyToken, async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await booksCollection.findOne(query);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }

    // Post api
    try {
      app.post("/books", verifyToken, async (req, res) => {
        const newBook = req.body
        const result = await booksCollection.insertOne(newBook)
        res.send(result)
      })
    } catch (error) {
      console.log(error);
    }

    // get by book name
    // try {
    //   app.get('/books', async (req, res) => {
    //     const query = {};
    //     if (req.body.book_name) {
    //       query = { book_name: req.query.book_name }
    //     }
    //     const result = await cursor.toArray();
    //     res.send(result);
    //   })
    // } catch (error) {
    //   console.log(error)
    // };


    // update one book
    // try {
    //   app.get('/updateBooks', async (req, res) => {

    //     const cursor = booksCollection.find();
    //     const result = await cursor.toArray();
    //     res.send(result);

    //   })
    // } catch (error) {
    //   console.log(error);
    // }


    // try {
    //   app.get('/updateBooks/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }
    //     const result = await booksCollection.findOne(query)
    //     res.send(result);

    //   })
    // } catch (error) {
    //   console.log(error);
    // }



    // try {
    //   app.put('/updateBooks/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const filter = { _id: new ObjectId(id) }
    //     console.log(id, filter);
    //   })
    // } catch (error) {
    //   console.log(error);

    // }





    /// update book api

    try {
      app.put('/books/:id', verifyToken, async (req, res) => {
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
              short_description: updateBook.short_description
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
      app.post('/borrowBooks', verifyToken, async (req, res) => {
        const borrowBooks = req.body;
        console.log(borrowBooks);
        const result = await borrowBookCollection.insertOne(borrowBooks);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    }


    //// get uuser his/her borrow books
    try {
      app.get('/borrowBooks', verifyToken, async (req, res) => {

        let query = {};
        if (req?.query?.email) {
          query = { email: req?.query?.email }
          console.log("query", query);
        }
        const result = await borrowBookCollection.find(query).toArray();
        res.send(result);
      })
    } catch (error) {
      console.log(error);
    }
    // try {
    //   app.get('/borrowBooks',verifyToken, async (req, res) => {
    //     // console.log(req.query?.email);
    //     let query = {};
    //     if (req?.query?.email) {
    //       query = { email: req?.query?.email }
    //       console.log(query);
    //     }
    //     const result = await borrowBookCollection.find(query).toArray();
    //     res.send(result);
    //   })
    // } catch (error) {
    //   console.log(error);
    // }


    //
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


    // return user borrow books
    try {
      app.delete('/borrowBooks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: (id) }
        const result = await borrowBookCollection.deleteOne(query);
        res.send(result);
      })
    } catch (error) {
      console.log(error)
    };



    // try {
    //   app.delete('/borrowBooks', async (req, res) => {
    //     let query = {};
    //     if (req.query.email) {
    //       query = { email: req.query.email }
    //     }

    //     const result = await borrowBookCollection.deleteMany(query);
    //     res.send(result);
    //   })
    // } catch (error) {
    //   console.log(error)
    // };



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})