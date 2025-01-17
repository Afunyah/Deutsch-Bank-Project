const { MongoClient } = require("mongodb");
var database = null;


async function connectDB() {
  // Set up credentials for MongoDB Atlas
  const credentials = "./config/X509-cert-8332540519884830521.pem";
  const client = new MongoClient(
    "mongodb+srv://cs261cluster28.wuoym.mongodb.net/myFirstDatabase?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
    {
      sslKey: credentials,
      sslCert: credentials,
    }
  );
  
  try {
    await client.connect();
    database = client.db("Data");
  } catch (e) {
    console.log(e);
  }
}

function fetchDB(){
  return database;
}

async function closeDB() {
  await client.close();
}

module.exports = {
  connectDB,
  fetchDB,
  closeDB
}
