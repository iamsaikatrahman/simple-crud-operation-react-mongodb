const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jr39v.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// client.connect((err) => {
//   const collection = client.db("productsdb").collection("products");
//   // perform actions on the collection object
//   console.log("Hitting the database");
//   const user = { name: "Watch", price: "23.69", quantity: "1" };
//   collection.insertOne(user).then(() => {
//     console.log("Insert Successfull");
//   });
//   //   client.close();
// });

async function run() {
  try {
    await client.connect();
    const database = client.db("productsdb");
    const productCollection = database.collection("products");
    //GET ALL DATA
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    // //GET SINGLE DATA
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    //POST
    app.post("/products", async (req, res) => {
      console.log("HIt database");
      const newProduct = req.body;
      // const doc = {
      //   name: "Laptop",
      //   price: "169.39",
      //   quantity: "1",
      // };
      const result = await productCollection.insertOne(newProduct);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      console.log(result);
      res.json(result);
    });
    //UPDATE
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
          quantity: updatedProduct.quantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    //DELETE
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Mongo DB to with node express");
});

app.listen(port, () => {
  console.log("Listenting to port", port);
});
