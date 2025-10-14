import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

// 환경변수 우선 사용, 없으면 개발 데이터베이스 사용
const developmentDatabaseUrl = "postgresql://neondb_owner:npg_NFjd6urhEpP2@ep-frosty-star-aeqoo75x.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
const databaseUrl = process.env.DATABASE_URL || developmentDatabaseUrl;
const isProduction = process.env.NODE_ENV === 'production';
const isUsingProductionDb = process.env.DATABASE_URL && process.env.DATABASE_URL !== developmentDatabaseUrl;

console.log("[DB] 환경:", process.env.NODE_ENV);
console.log("[DB] 프로덕션 데이터베이스 사용:", isUsingProductionDb ? "예" : "아니오");
console.log("[DB] 데이터베이스 서버:", databaseUrl.split('@')[1]?.split('/')[0]);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });