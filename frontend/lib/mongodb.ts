import { MongoClient } from "mongodb";

const uri = (() => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_CROP_PASSWORD;

  if (!username || username === "myusername" || !password) {
    // Local fallback for offline/development simplicity
    return "mongodb://127.0.0.1:27017/crop_advisory";
  }
  
  // Construct MongoDB Atlas connection string
  // If a specific cluster domain is provided in env, use it, otherwise fallback to a common template.
  const cluster = process.env.MONGO_CLUSTER || "cluster0.gxzpq.mongodb.net";
  return `mongodb+srv://${encodeURIComponent(username.trim())}:${encodeURIComponent(password.trim())}@${cluster}/crop_db?retryWrites=true&w=majority`;
})();

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Prevent multiple connections during Next.js Hot Module Replacement (HMR)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
export { uri };
