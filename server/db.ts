import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

// 환경 변수가 없으면 직접 설정
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_NFjd6urhEpP2@ep-frosty-star-aeqoo75x.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });