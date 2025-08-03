import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// __dirname 에뮬레이션 (ESM에서는 __dirname이 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 마이그레이션 파일 경로
const migrationFile = path.join(__dirname, '..', 'migrations', '0003_add_wine_bottles.sql');

// 마이그레이션 파일 존재 확인
if (!fs.existsSync(migrationFile)) {
  console.error(`마이그레이션 파일이 존재하지 않습니다: ${migrationFile}`);
  process.exit(1);
}

// PostgreSQL 환경 변수 로드
dotenv.config();

// 데이터베이스 접속 정보 (환경 변수 또는 기본값 사용)
const {
  PGHOST = 'localhost',
  PGPORT = 5432,
  PGDATABASE = 'winelabelmaker',
  PGUSER = 'postgres',
  PGPASSWORD = 'postgres'
} = process.env;

// SQL 파일 실행 명령
const command = `psql postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE} -f "${migrationFile}"`;

try {
  // 명령 실행
  console.log('와인병 테이블 마이그레이션을 시작합니다...');
  execSync(command, { stdio: 'inherit' });
  console.log('와인병 테이블 마이그레이션이 성공적으로 완료되었습니다.');
} catch (error) {
  console.error('마이그레이션 중 오류가 발생했습니다:', error);
  process.exit(1);
} 