import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas conectado');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB Atlas:', err);
    process.exit(1);
  }
};
