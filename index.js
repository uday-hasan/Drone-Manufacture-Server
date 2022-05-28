const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors())
app.use(express.json())
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jb74a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect()
        const partsCollection = client.db(`dronemanufacture`).collection('parts');
        const partsOrders = client.db(`dronemanufacture`).collection('orders');

        //Load all parts
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query)
            const parts = await cursor.toArray()
            res.send(parts)
        })
        //Load single part
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const part = await partsCollection.findOne(query)
            res.send(part);
        })
        //Insert new order
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await partsOrders.insertOne(product);
            res.send(result)
        })
        //Load all order
        app.get('/orders', async (req, res) => {
            const doc = {};
            const result = await partsOrders.find(doc).toArray();
            res.send(result)
        })

        //Update stock quantity
        app.put('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const stock = req.body.newStock;
            const quantity = req.body.userQuantity;
            const available = stock - quantity;
            console.log(stock, quantity, (stock - quantity));
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: { available }
            }
            const result = await partsCollection.updateOne(query, updateDoc)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', async (req, res) => {
    res.send('Welcome')
})
app.listen(port, () => {
    console.log('Listening from port : ', port);
})

