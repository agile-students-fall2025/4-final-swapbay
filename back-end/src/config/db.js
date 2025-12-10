import mongoose from 'mongoose';

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

export default connectDB;
