const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const usersCollection = client.db("coffeeDB").collection("users");

    // coffee related api

    app.get("/coffee", async (req, res) => {
      const cursur = coffeeCollection.find();
      const coffee = await cursur.toArray();

      res.send(coffee);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);

      res.send(result);
    });

    app.post("/add-coffee", async (req, res) => {
      const newCoffee = req.body;

      const result = await coffeeCollection.insertOne(newCoffee);

      res.send(result);
    });

    app.put("/update-coffee/:id", async (req, res) => {
      const id = req.params.id;
      const coffeeUpdate = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedCoffee = {
        $set: {
          name: coffeeUpdate.name,
          available: coffeeUpdate.available,
          supplier: coffeeUpdate.supplier,
          taste: coffeeUpdate.taste,
          category: coffeeUpdate.category,
          details: coffeeUpdate.details,
          photo: coffeeUpdate.photo,
        },
      };

      const result = await coffeeCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );

      res.send(result);
    });

    app.delete("/delete-coffee/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await coffeeCollection.deleteOne(query);

      res.send(result);
    });

    // users related api

    app.get("/users", async (req, res) => {
      const cursur = await usersCollection.find();

      const users = await cursur.toArray();

      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await usersCollection.insertOne(user);

      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await usersCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.log(err);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`server is runing on port ${port}`);
});
