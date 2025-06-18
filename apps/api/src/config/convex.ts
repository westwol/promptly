import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';

dotenv.config();

export const client = new ConvexHttpClient(process.env.CONVEX_URL ?? '');
