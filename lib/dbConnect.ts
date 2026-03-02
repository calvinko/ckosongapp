import mongoose from "mongoose";

export const runtime = 'nodejs'; // Use the Node.js runtime

/**
 * Connects to MongoDB database, ignores if already connected
 */
async function dbConnect() {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  //@ts-ignore
  return mongoose.connect(process.env.MONGO_URI)
    .catch(err => console.log(`Error connecting to MongoDB: ${err}`));;
}

export default dbConnect;
