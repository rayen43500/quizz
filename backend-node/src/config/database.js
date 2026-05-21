import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri);
  console.log(`[MongoDB] Connected to ${config.mongodbUri.split('@').pop() || 'database'}`);
}
