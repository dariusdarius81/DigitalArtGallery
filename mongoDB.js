const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";
const dbName = "DigitalArtGallery";
let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(url); // Removed useUnifiedTopology option
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
    throw err;
  }
};

const getDb = () => {
  if (!db) {
    throw Error("Database not initialized");
  }
  return db;
};

module.exports = { connectDB, getDb };
