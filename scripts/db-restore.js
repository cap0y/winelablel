import { Pool, neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// 복원 대상 DB 연결 정보
const TARGET_DB_URL = "postgresql://neondb_owner:npg_RsrKq97JQkao@ep-summer-silence-a1az2fef-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '..', 'backups');

// 가장 최근 백업 파일 찾기
const backupFiles = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql')).sort().reverse();
if (backupFiles.length === 0) {
  console.error('❌ 백업 파일을 찾을 수 없습니다.');
  process.exit(1);
}

const backupFile = path.join(backupDir, backupFiles[0]);
console.log(`📁 복원할 백업 파일: ${backupFiles[0]}\n`);

const pool = new Pool({ connectionString: TARGET_DB_URL });

async function restore() {
  const client = await pool.connect();

  try {
    console.log('🔗 대상 데이터베이스 연결 성공');
    console.log('   → ep-summer-silence-a1az2fef.ap-southeast-1.aws.neon.tech/neondb\n');

    // 0단계: 기존 public 스키마 완전 초기화
    console.log('🧹 [0/5] 기존 스키마 완전 초기화...');
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO neondb_owner');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    console.log('   ✓ public 스키마 초기화 완료\n');

    const sqlContent = fs.readFileSync(backupFile, 'utf8');

    // SQL 문장 분리
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // 1단계: 테이블 생성 (CREATE TABLE)
    console.log('📝 [1/5] 테이블 생성 중...');
    const createStatements = statements.filter(s => s.toUpperCase().startsWith('CREATE TABLE'));
    for (const stmt of createStatements) {
      try {
        await client.query(stmt);
        const tableName = stmt.match(/"([^"]+)"/)?.[1] || '?';
        console.log(`   ✓ ${tableName} 생성`);
      } catch (e) {
        console.error(`   ✗ 오류: ${e.message}`);
      }
    }

    // 2단계: 데이터 삽입 (INSERT INTO) - FK 제약 없이 먼저 삽입
    console.log('\n💾 [2/5] 데이터 복원 중...');
    const insertStatements = statements.filter(s => s.toUpperCase().startsWith('INSERT INTO'));

    const tableCount = {};
    let insertedCount = 0;
    let errorCount = 0;

    for (const stmt of insertStatements) {
      const tableName = stmt.match(/INSERT INTO "([^"]+)"/)?.[1] || '?';
      tableCount[tableName] = (tableCount[tableName] || 0) + 1;
    }

    for (const stmt of insertStatements) {
      try {
        await client.query(stmt);
        insertedCount++;
      } catch (e) {
        errorCount++;
        const tableName = stmt.match(/INSERT INTO "([^"]+)"/)?.[1] || '?';
        console.error(`   ✗ [${tableName}] ${e.message.substring(0, 80)}`);
      }
    }

    console.log('');
    for (const [table, count] of Object.entries(tableCount)) {
      console.log(`   ✓ ${table}: ${count}건`);
    }
    console.log(`   📊 총 삽입: ${insertedCount}건`);

    // 3단계: 외래키 제약조건 추가
    console.log('\n🔗 [3/5] 외래키 제약조건 추가 중...');
    const alterStatements = statements.filter(s => s.toUpperCase().startsWith('ALTER TABLE'));
    for (const stmt of alterStatements) {
      try {
        await client.query(stmt);
        const constraintName = stmt.match(/CONSTRAINT "([^"]+)"/)?.[1] || '?';
        console.log(`   ✓ ${constraintName}`);
      } catch (e) {
        console.error(`   ✗ FK 오류: ${e.message.substring(0, 80)}`);
      }
    }

    // 4단계: 시퀀스 재설정
    console.log('\n🔄 [4/5] 시퀀스 재설정 중...');
    const seqStatements = statements.filter(s => s.toUpperCase().startsWith('SELECT SETVAL'));
    for (const stmt of seqStatements) {
      try {
        await client.query(stmt);
      } catch (e) {
        console.error(`   ✗ 시퀀스 오류: ${e.message.substring(0, 80)}`);
      }
    }
    console.log(`   ✓ ${seqStatements.length}개 시퀀스 재설정`);

    // 5단계: 검증
    console.log('\n🔍 [5/5] 복원 데이터 검증 중...');
    const verifyResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    for (const row of verifyResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) as cnt FROM "${row.table_name}"`);
      console.log(`   ✓ ${row.table_name}: ${countResult.rows[0].cnt}건`);
    }

    // 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('✅ 데이터베이스 복원 완료!');
    console.log(`📊 삽입 성공: ${insertedCount}건`);
    if (errorCount > 0) {
      console.log(`⚠️  오류: ${errorCount}건`);
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 복원 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

restore();
