const { MongoClient } = require("mongodb");

let _db;

const uri = "mongodb+srv://ayushks2805_db_user:PNtCBt8amzbgIhRj@cluster0.rcjoti7.mongodb.net/snapShop?retryWrites=true&w=majority&appName=Cluster0";

const mongoConnect = async (callback) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("MongoDB Connected Successfully!");
    _db = client.db();
    callback();
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    throw err;
  }
};

const getDb = () => {
  if (!_db) throw new Error("Database connection not initialized!");
  return _db;
};

module.exports = { mongoConnect, getDb };
