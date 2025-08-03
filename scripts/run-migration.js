// 마이그레이션 실행 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    // 마이그레이션 파일 읽기
    const migrationPath = path.join(__dirname, '../migrations/0001_add_shipping_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // SQL 문을 개별적으로 분리
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log('마이그레이션 실행 중...');
    
    // 각 SQL 문을 개별적으로 실행
    for (const statement of statements) {
      try {
        console.log(`실행: ${statement}`);
        await pool.query(statement);
        console.log('성공!');
      } catch (err) {
        // 이미 컬럼이 존재하는 경우는 무시하고 계속 진행
        if (err.code === '42701') { // column already exists 에러 코드
          console.log(`주의: ${err.message} (무시하고 계속 진행)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('마이그레이션 완료!');
  } catch (error) {
    console.error('마이그레이션 오류:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 