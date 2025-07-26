import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 설정
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_NFjd6urhEpP2@ep-frosty-star-aeqoo75x.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  try {
    console.log('마이그레이션 시작...');
    
    // 마이그레이션 폴더에서 모든 SQL 파일 로드
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    
    console.log(`${sqlFiles.length}개의 마이그레이션 파일을 찾았습니다.`);
    
    // 각 SQL 파일 실행
    for (const file of sqlFiles) {
      console.log(`실행 중: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      
      // SQL 명령어 실행
      await pool.query(sql);
      console.log(`완료: ${file}`);
    }
    
    console.log('모든 마이그레이션이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('마이그레이션 오류:', error);
  } finally {
    // 연결 종료
    await pool.end();
  }
}

runMigrations(); 