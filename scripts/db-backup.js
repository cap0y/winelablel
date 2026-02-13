import { Pool, neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// 백업 대상 DB 연결 정보
const DATABASE_URL = "postgresql://neondb_owner:npg_6BmELv9JHGUj@ep-billowing-mouse-a56v7793.us-east-2.aws.neon.tech/neondb?sslmode=require";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '..', 'backups');

// backups 폴더 생성
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

const pool = new Pool({ connectionString: DATABASE_URL });

async function backup() {
  const client = await pool.connect();
  let sql = '';

  try {
    console.log('🔗 데이터베이스 연결 성공');
    console.log('📋 테이블 목록 조회 중...\n');

    // 1. 모든 테이블 목록 조회
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📊 발견된 테이블: ${tables.length}개`);
    tables.forEach(t => console.log(`   - ${t}`));
    console.log('');

    sql += `-- =============================================\n`;
    sql += `-- Wine Label Maker 데이터베이스 백업\n`;
    sql += `-- 백업 일시: ${new Date().toLocaleString('ko-KR')}\n`;
    sql += `-- 소스 DB: ep-billowing-mouse-a56v7793.us-east-2.aws.neon.tech/neondb\n`;
    sql += `-- =============================================\n\n`;

    // 2. 각 테이블의 DDL(스키마) 생성
    for (const table of tables) {
      console.log(`📝 [${table}] 스키마 백업 중...`);

      // 컬럼 정보 조회
      const columnsResult = await client.query(`
        SELECT column_name, data_type, character_maximum_length, 
               column_default, is_nullable, udt_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      // 기본키 조회
      const pkResult = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
      `, [table]);
      const pkColumns = pkResult.rows.map(r => r.column_name);

      // 시퀀스 정보 조회
      const seqResult = await client.query(`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
          AND column_default LIKE 'nextval%'
      `, [table]);

      sql += `-- ---- 테이블: ${table} ----\n`;
      sql += `DROP TABLE IF EXISTS "${table}" CASCADE;\n`;
      sql += `CREATE TABLE "${table}" (\n`;

      const colDefs = columnsResult.rows.map(col => {
        let typeName = col.data_type;
        if (col.udt_name === 'int4') typeName = 'INTEGER';
        else if (col.udt_name === 'int8') typeName = 'BIGINT';
        else if (col.udt_name === 'text') typeName = 'TEXT';
        else if (col.udt_name === 'bool') typeName = 'BOOLEAN';
        else if (col.udt_name === 'timestamp') typeName = 'TIMESTAMP';
        else if (col.udt_name === 'timestamptz') typeName = 'TIMESTAMPTZ';
        else if (col.udt_name === 'jsonb') typeName = 'JSONB';
        else if (col.udt_name === 'json') typeName = 'JSON';
        else if (col.udt_name === 'numeric') typeName = 'NUMERIC';
        else if (col.udt_name === 'varchar') typeName = col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
        else if (col.udt_name === 'uuid') typeName = 'UUID';
        else typeName = col.data_type.toUpperCase();

        let def = `  "${col.column_name}" ${typeName}`;
        if (col.column_default && col.column_default.startsWith('nextval')) {
          def = `  "${col.column_name}" SERIAL`;
        } else if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        return def;
      });

      if (pkColumns.length > 0) {
        colDefs.push(`  PRIMARY KEY (${pkColumns.map(c => `"${c}"`).join(', ')})`);
      }

      sql += colDefs.join(',\n');
      sql += `\n);\n\n`;
    }

    // 3. 외래키 제약조건 추가
    const fkResult = await client.query(`
      SELECT 
        tc.table_name, kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);

    if (fkResult.rows.length > 0) {
      sql += `-- ---- 외래키 제약조건 ----\n`;
      for (const fk of fkResult.rows) {
        sql += `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
        sql += `FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}");\n`;
      }
      sql += `\n`;
    }

    // 4. 각 테이블 데이터 백업
    let totalRows = 0;
    for (const table of tables) {
      const dataResult = await client.query(`SELECT * FROM "${table}"`);
      const rows = dataResult.rows;

      if (rows.length === 0) {
        console.log(`   [${table}] 데이터 없음 (빈 테이블)`);
        sql += `-- [${table}] 데이터 없음\n\n`;
        continue;
      }

      console.log(`💾 [${table}] ${rows.length}건 데이터 백업 중...`);
      totalRows += rows.length;

      const columns = Object.keys(rows[0]);
      sql += `-- ---- ${table} 데이터 (${rows.length}건) ----\n`;

      for (const row of rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'number') return val.toString();
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });

        sql += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sql += `\n`;
    }

    // 5. 시퀀스 값 재설정
    sql += `-- ---- 시퀀스 재설정 ----\n`;
    for (const table of tables) {
      const seqCheck = await client.query(`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
          AND column_default LIKE 'nextval%'
      `, [table]);

      for (const seq of seqCheck.rows) {
        const maxResult = await client.query(`SELECT COALESCE(MAX("${seq.column_name}"), 0) + 1 as next_val FROM "${table}"`);
        const seqName = seq.column_default.match(/nextval\('([^']+)'/)?.[1];
        if (seqName) {
          sql += `SELECT setval('${seqName}', ${maxResult.rows[0].next_val}, false);\n`;
        }
      }
    }

    // 파일 저장
    fs.writeFileSync(backupFile, sql, 'utf8');
    const fileSizeKB = (fs.statSync(backupFile).size / 1024).toFixed(1);

    console.log(`\n✅ 백업 완료!`);
    console.log(`📁 파일: ${backupFile}`);
    console.log(`📊 총 ${tables.length}개 테이블, ${totalRows}건 데이터`);
    console.log(`💿 파일 크기: ${fileSizeKB} KB`);

  } catch (error) {
    console.error('❌ 백업 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

backup();

