const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

console.log("user", process.env.USER_DB)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.4gy1j38.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        await client.connect();
        console.log("You successfully connected to MongoDB!✅");

        const userCollection = client.db("bistro_DB").collection("users");
        const menuCollection = client.db("bistro_DB").collection("menu");
        const reviewsCollection = client.db("bistro_DB").collection("reviews");
        const cardsCollection = client.db("bistro_DB").collection("cards");


        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token });
        })
        // middleware
        const verifyToken = (req, res, next) => {
            console.log('inside vrtyfi token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ error: true, message: 'forbiden access' })
            }
            const token = req.headers.authorization.split(' ')[1];

            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ error: true, message: 'forbiden access' })
                }
                req.decoded = decoded;
                next();
            });
        }


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existinguser = await userCollection.findOne(query)
            if (existinguser) {
                return res.send({ message: "user already exits", user: null });
            }

            const result = await userCollection.insertOne(user)
            res.send(result);
        });

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        });
        app.get('/users', verifyToken, async (req, res) => {

            const result = await userCollection.find().toArray();
            res.send(result)
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)

        });


        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result)

        });

        app.get('/cards', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await cardsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/cards', async (req, res) => {
            const cartItem = req.body
            const result = await cardsCollection.insertOne(cartItem)
            res.send(result)
        });

        app.delete('/cards/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await cardsCollection.deleteOne(query)
            res.send(result)
        })


    }
    catch (error) {
        console.error("error❌", error)
    }
}
run();


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
