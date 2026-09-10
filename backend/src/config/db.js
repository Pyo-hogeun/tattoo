import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const connectDB = async (mongoUri) => {
  await mongoose.connect(mongoUri);
  // kakaoId used to be a required unique field. Keep the deployed index in sync so
  // multiple ID/PW accounts can omit kakaoId without colliding on the legacy index.
  await User.syncIndexes();
  console.log(`[DB] connected: ${mongoUri}`);
};
