import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';

dotenv.config();

export const client = new ConvexHttpClient(process.env.CONVEX_URL ?? '');
