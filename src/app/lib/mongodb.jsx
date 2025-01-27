// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so the client is not recreated across hot reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  console.log(" You are connected to DB")
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each request.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;