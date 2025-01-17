const { MongoClient } = require("mongodb");

// Set up credentials for MongoDB Atlas
const credentials = "./config/X509-cert-8332540519884830521.pem";
const client = new MongoClient(
  "mongodb+srv://cs261cluster28.wuoym.mongodb.net/myFirstDatabase?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
  {
    sslKey: credentials,
    sslCert: credentials,
  }
);

async function DBconnect() {
  var database = null;
  try {
    await client.connect();
    database = client.db("Data");
  } catch (e) {
    console.log(e);
  }
  return database;
}

async function DBclose() {
  await client.close();
}

exports.connect = DBconnect();
exports.close = DBclose();
