const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

console.log("user", process.env.USER_DB)

const { MongoClient, ServerApiVersion } = require('mongodb');
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

        const menuCollection = client.db("bistro_DB").collection("menu");
        const reviewsCollection = client.db("bistro_DB").collection("reviews");
        

        app.get('/menu', async(req, res) => {
            const result=await menuCollection.find().toArray();
            res.send(result)

        });


        app.get('/reviews', async(req, res) => {
            const result=await reviewsCollection.find().toArray();
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
