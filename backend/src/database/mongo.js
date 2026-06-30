import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectMongo() {
  await mongoose.connect(env.mongoUri);
}

const ResumeContentSchema = new mongoose.Schema(
  {
    resumeId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiHistory: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { timestamps: true }
);

export const ResumeContent = mongoose.model('ResumeContent', ResumeContentSchema);

