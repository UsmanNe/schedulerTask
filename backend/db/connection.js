import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';

const uri = process.env.MONGO_URL;

mongoose.connect(uri);

const db = mongoose.connection;

export default db;
