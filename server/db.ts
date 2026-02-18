import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

// DATABASE_URL 환경변수 필수 (Railway Variables 또는 .env에서 설정)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[DB] DATABASE_URL 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

console.log("[DB] 환경:", process.env.NODE_ENV);
console.log("[DB] 데이터베이스 서버:", databaseUrl.split('@')[1]?.split('/')[0]);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });